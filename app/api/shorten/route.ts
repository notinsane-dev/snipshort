import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@clerk/nextjs/server";

import { createServiceClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis";
import { generateSlug, isValidCustomSlug } from "@/lib/nanoid";
import { shortenRatelimit } from "@/lib/ratelimit";
import { getIp } from "@/lib/getIp";

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const ShortenSchema = z.object({
  destinationUrl: z
    .string()
    .url("Must be a valid URL.")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "Only http:// and https:// URLs are allowed."
    ),

  customSlug: z
    .string()
    .optional(),

  expiresInDays: z
    .number({ error: "expiresInDays must be a positive integer." })
    .int("expiresInDays must be a whole number.")
    .positive("expiresInDays must be greater than zero.")
    .optional(),

  password: z
    .string()
    .min(4, "Password must be at least 4 characters.")
    .optional(),
});

type ShortenBody = z.infer<typeof ShortenSchema>;

// ---------------------------------------------------------------------------
// Redis cache value shape
// ---------------------------------------------------------------------------
// Stored as JSON so the redirect handler (/r/[slug]) can make decisions
// (e.g. password gate) without ever hitting Supabase.

interface CachedLink {
  destinationUrl: string;
  isPasswordProtected: boolean;
  expiresAt: string | null;
}

// ---------------------------------------------------------------------------
// Postgres unique-violation error code
// ---------------------------------------------------------------------------
const PG_UNIQUE_VIOLATION = "23505";

// Max retries when a generated slug collides in the DB.
const MAX_SLUG_RETRIES = 3;

// ---------------------------------------------------------------------------
// POST /api/shorten
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // ── 0a. Clerk session (optional — guests can still shorten) ───────────────
  // userId will be null for unauthenticated visitors; their links are stored
  // with user_id = null. Authenticated users' links are tied to their account.
  const { userId } = await auth();

  // ── 0b. Rate limiting ─────────────────────────────────────────────────────
  // shortenRatelimit is null when UPSTASH_REDIS_REST_URL/TOKEN are not set
  // (local dev without Upstash). The check is skipped gracefully in that case.
  if (shortenRatelimit) {
    const ip = getIp(request);
    const { success, limit, remaining, reset } = await shortenRatelimit.limit(ip);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down.",
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
  let body: ShortenBody;

  try {
    const raw = await request.json();
    const result = ShortenSchema.safeParse(raw);

    if (!result.success) {
      const messages = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json({ errors: messages }, { status: 400 });
    }

    body = result.data;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { destinationUrl, customSlug, expiresInDays, password } = body;

  // ── 2. Validate custom slug ───────────────────────────────────────────────
  if (customSlug !== undefined) {
    if (!isValidCustomSlug(customSlug)) {
      return NextResponse.json(
        {
          error:
            "Invalid custom slug. Use 3–30 alphanumeric characters, hyphens, or underscores. Reserved words are not allowed.",
        },
        { status: 400 }
      );
    }
  }

  // ── 3. Compute optional fields ────────────────────────────────────────────
  const expiresAt: string | null = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null;

  let passwordHash: string | null = null;
  let isPasswordProtected = false;

  if (password) {
    try {
      passwordHash = await bcrypt.hash(password, 10);
      isPasswordProtected = true;
    } catch {
      console.error("[shorten] bcrypt error");
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }
  }

  // ── 4. Supabase service-role client ──────────────────────────────────────
  // Service-role key is used here for two reasons:
  //   a) Checking slug uniqueness requires a SELECT that bypasses RLS
  //      (the anon role's SELECT policy is row-permissive but we want
  //      to be certain we see every row regardless of future policy changes).
  //   b) The INSERT must succeed even before user auth is wired up.
  let supabase: Awaited<ReturnType<typeof createServiceClient>>;

  try {
    supabase = await createServiceClient();
  } catch {
    console.error("[shorten] failed to create Supabase client");
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }

  // ── 5. Resolve the slug ───────────────────────────────────────────────────
  let slug: string;

  if (customSlug) {
    // Check uniqueness for custom slugs explicitly (better error message than
    // letting the DB constraint fire).
    try {
      const { data, error } = await supabase
        .from("links")
        .select("id")
        .eq("slug", customSlug)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return NextResponse.json(
          { error: `The slug "${customSlug}" is already taken.` },
          { status: 409 }
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[shorten] slug uniqueness check failed:", msg);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }

    slug = customSlug;
  } else {
    // Auto-generate and retry up to MAX_SLUG_RETRIES times on collision.
    slug = generateSlug();

    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      const { data, error } = await supabase
        .from("links")
        .insert({
          slug,
          destination_url: destinationUrl,
          expires_at: expiresAt,
          is_password_protected: isPasswordProtected,
          password_hash: passwordHash,
          user_id: userId ?? null,
        })
        .select("id, slug, created_at")
        .single();

      if (!error) {
        // Happy path — write to Redis and return early.
        await cacheInRedis(slug, destinationUrl, isPasswordProtected, expiresAt);
        return NextResponse.json(
          buildResponse(slug, data.created_at, expiresAt),
          { status: 201 }
        );
      }

      // Postgres unique-violation on `slug` — regenerate and retry.
      if (isPostgresError(error) && error.code === PG_UNIQUE_VIOLATION) {
        slug = generateSlug();
        continue;
      }

      // Any other DB error — bail out immediately.
      console.error("[shorten] insert error:", error.message);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }

    // All retries exhausted (extremely unlikely with 55^7 ≈ 1.15T combinations).
    console.error("[shorten] slug collision exhausted after", MAX_SLUG_RETRIES, "retries");
    return NextResponse.json(
      { error: "Could not generate a unique slug. Please try again." },
      { status: 503 }
    );
  }

  // ── 6. Insert custom slug ─────────────────────────────────────────────────
  // (Only reached for the customSlug path — auto-slug inserts happen inside
  //  the retry loop above and return early.)
  try {
    const { data, error } = await supabase
      .from("links")
      .insert({
        slug,
        destination_url: destinationUrl,
        expires_at: expiresAt,
        is_password_protected: isPasswordProtected,
        password_hash: passwordHash,
        user_id: userId ?? null,
      })
      .select("id, slug, created_at")
      .single();

    if (error) {
      console.error("[shorten] insert error:", error.message);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 }
      );
    }

    await cacheInRedis(slug, destinationUrl, isPasswordProtected, expiresAt);

    return NextResponse.json(
      buildResponse(slug, data.created_at, expiresAt),
      { status: 201 }
    );
  } catch {
    console.error("[shorten] unexpected error during insert");
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Write the slug → destination mapping to Redis.
 * - Uses SETEX (with TTL) when the link has an expiry.
 * - Uses SET (no TTL) for permanent links.
 *
 * Storing { destinationUrl, isPasswordProtected } means the redirect handler
 * never needs a DB round-trip — it has everything it needs from the cache.
 */
async function cacheInRedis(
  slug: string,
  destinationUrl: string,
  isPasswordProtected: boolean,
  expiresAt: string | null
): Promise<void> {
  const value: CachedLink = { destinationUrl, isPasswordProtected, expiresAt };
  const json = JSON.stringify(value);
  const key = `link:${slug}`;

  try {
    if (expiresAt) {
      const ttlSeconds = Math.max(
        1,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      await redis.setex(key, ttlSeconds, json);
    } else {
      await redis.set(key, json);
    }
  } catch (err) {
    // Redis failure is non-fatal — the redirect handler falls back to Supabase.
    console.error("[shorten] Redis cache write failed:", err);
  }
}

/** Shape the 201 response body. */
function buildResponse(slug: string, createdAt: string, expiresAt: string | null) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return {
    slug,
    shortUrl: `${base}/r/${slug}`,
    createdAt,
    expiresAt,
  };
}

/**
 * Type-narrow an unknown Supabase/PostgREST error to something with a `code`
 * field, which is how Postgres error codes are surfaced.
 */
function isPostgresError(err: unknown): err is { code: string; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as Record<string, unknown>).code === "string"
  );
}
