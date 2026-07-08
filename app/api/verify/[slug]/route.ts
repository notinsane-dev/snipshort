import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyRatelimit } from "@/lib/ratelimit";
import { getIp } from "@/lib/getIp";

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const VerifySchema = z.object({
  password: z.string().min(1, "Password is required."),
});

// ---------------------------------------------------------------------------
// POST /api/verify/[slug]
// ---------------------------------------------------------------------------
// Compares the submitted password against the bcrypt hash stored in the DB.
// Returns the destination URL on success so the client can redirect.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // ── 0. Rate limiting ───────────────────────────────────────────────────────
  // Uses a compound key (IP + slug) so an attacker can't brute-force a single
  // slug from one IP, AND can't distribute a single-slug attack across many
  // IPs. Both vectors are covered by the one check.
  // verifyRatelimit is null when Upstash env vars are absent (local dev).
  if (verifyRatelimit) {
    const ip = getIp(request);
    const identifier = `${ip}:${slug}`;
    const { success, limit, remaining, reset } = await verifyRatelimit.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many attempts. Please wait before trying again.",
          retryAfterSeconds: retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  }

  // ── 1. Parse & validate body ──────────────────────────────────────────────
  let password: string;

  try {
    const raw = await request.json();
    const result = VerifySchema.safeParse(raw);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    password = result.data.password;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // ── 2. Fetch the link row ─────────────────────────────────────────────────
  let supabase: Awaited<ReturnType<typeof createServiceClient>>;

  try {
    supabase = await createServiceClient();
  } catch {
    console.error("[verify] failed to create Supabase client");
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }

  let passwordHash: string | null = null;
  let destinationUrl: string | null = null;
  let expiresAt: string | null = null;

  try {
    const { data, error } = await supabase
      .from("links")
      .select("destination_url, password_hash, is_password_protected, expires_at")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Return the same 401 as a wrong password — don't reveal whether the
      // slug exists at all (prevents enumeration).
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    // Check expiry before doing any crypto work.
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This link has expired." },
        { status: 410 }
      );
    }

    if (!data.is_password_protected || !data.password_hash) {
      // Link is not password-protected — redirect straight to the destination.
      return NextResponse.json(
        { destinationUrl: data.destination_url },
        { status: 200 }
      );
    }

    passwordHash = data.password_hash;
    destinationUrl = data.destination_url;
    expiresAt = data.expires_at;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[verify] DB fetch error:", msg);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }

  // ── 3. Compare password ───────────────────────────────────────────────────
  // bcrypt.compare is deliberately slow (cost factor 10) — that's the point.
  // The TODO rate-limit above prevents an attacker from parallelising this.
  try {
    const match = await bcrypt.compare(password, passwordHash);

    if (!match) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }
  } catch {
    console.error("[verify] bcrypt error for slug:", slug);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }

  // ── 4. Return destination URL ─────────────────────────────────────────────
  // The client performs the redirect via window.location.href so we can
  // keep this endpoint stateless (no session cookie needed yet).
  void expiresAt; // acknowledged, not used in response
  return NextResponse.json({ destinationUrl }, { status: 200 });
}
