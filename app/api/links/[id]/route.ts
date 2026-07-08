import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createUserClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis";
import type { LinkUpdate } from "@/types";

// ---------------------------------------------------------------------------
// PATCH /api/links/[id]  — update title, destination_url, or expires_at
// DELETE /api/links/[id] — delete a link
//
// Ownership is enforced ENTIRELY by Supabase RLS:
//   UPDATE / DELETE ... USING ((auth.jwt() ->> 'sub') = user_id)
//
// NOTE: policies use (auth.jwt() ->> 'sub'), NOT auth.uid() — Supabase's
// auth.uid() casts the JWT "sub" claim to ::uuid internally, which throws on
// Clerk's non-UUID user IDs (e.g. "user_3GBg0d22..."). Reading the claim
// directly as text avoids that cast entirely.
//
// If a user passes someone else's link ID, the Supabase query returns 0 rows
// affected (UPDATE) or silently no-ops (DELETE) without revealing that the row
// exists. No application-level ownership check is needed — RLS is authoritative.
//
// createUserClient() passes the Clerk JWT as Authorization: Bearer <token>.
// Supabase verifies it against Clerk's JWKS. A forged or missing token results
// in the sub claim being absent, making the USING clause false for every row.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const PatchSchema = z.object({
  title: z.string().max(120).optional(),
  destinationUrl: z
    .string()
    .url("Must be a valid URL.")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "Only http:// and https:// URLs are allowed."
    )
    .optional(),
  expiresAt: z
    .string()
    .datetime({ message: "expiresAt must be an ISO 8601 datetime string." })
    .nullable()
    .optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Invalidate the Redis cache key for a slug after an update/delete. */
async function bustCache(slug: string): Promise<void> {
  try {
    await redis.del(`link:${slug}`);
  } catch (err) {
    console.error("[links/[id]] Redis cache bust failed for slug %s:", slug, err);
  }
}

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify Clerk session exists — middleware handles protected pages but API
  // routes are not automatically blocked, so we check explicitly here.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Parse body
  let body: z.infer<typeof PatchSchema>;
  try {
    const raw = await request.json();
    const result = PatchSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    body = result.data;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  if (!body.title && !body.destinationUrl && body.expiresAt === undefined) {
    return NextResponse.json(
      { error: "Provide at least one field to update." },
      { status: 400 }
    );
  }

  const supabase = await createUserClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Build the update payload
  const updatePayload: LinkUpdate = {};
  if (body.title !== undefined) updatePayload.title = body.title;
  if (body.destinationUrl !== undefined)
    updatePayload.destination_url = body.destinationUrl;
  if (body.expiresAt !== undefined) updatePayload.expires_at = body.expiresAt;

  try {
    const { data, error } = await supabase
      .from("links")
      .update(updatePayload)
      .eq("id", id)
      .select("slug, destination_url, title, expires_at")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // RLS rejected the update (not the owner) or row doesn't exist.
      // Return 404 — don't reveal whether row exists to other users.
      return NextResponse.json(
        { error: "Link not found." },
        { status: 404 }
      );
    }

    // Invalidate Redis cache so the redirect handler picks up changes.
    void bustCache(data.slug);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[links/[id]] PATCH error:", msg);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = await createUserClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    // Fetch the slug first so we can bust the Redis cache after deletion.
    // RLS ensures this SELECT only returns the row if user_id matches the caller's Clerk sub claim.
    const { data: existing } = await supabase
      .from("links")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Link not found." }, { status: 404 });
    }

    const { error } = await supabase.from("links").delete().eq("id", id);

    if (error) throw error;

    // Remove from Redis cache immediately.
    void bustCache(existing.slug);

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[links/[id]] DELETE error:", msg);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
