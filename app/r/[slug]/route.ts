import { type NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis";
import { trackClick } from "@/lib/trackClick";

// ---------------------------------------------------------------------------
// Cache value shape (must match what POST /api/shorten writes)
// ---------------------------------------------------------------------------
interface CachedLink {
  destinationUrl: string;
  isPasswordProtected: boolean;
  expiresAt: string | null;
}

// ---------------------------------------------------------------------------
// GET /r/[slug]
// ---------------------------------------------------------------------------
// Resolution order:
//   1. Redis cache  (key: link:<slug>)  → ~1–5 ms
//   2. Supabase DB  (cache miss)        → ~10–50 ms + writes back to Redis
//
// Redirect outcomes:
//   slug not found  → 302 /link-not-found
//   expired         → 302 /expired
//   password-gated  → 302 /verify/<slug>
//   valid           → 307 destinationUrl  (307 preserves POST method if ever needed)
//
// Click tracking is fire-and-forget — never awaited, never delays the redirect.
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const base = request.nextUrl.origin;

  // ── 1. Redis cache lookup ────────────────────────────────────────────────
  let link: CachedLink | null = null;

  try {
    const cached = await redis.get(`link:${slug}`);
    if (cached) {
      link = JSON.parse(cached) as CachedLink;
    }
  } catch (err) {
    // Redis unavailable — fall through to Supabase. Non-fatal.
    console.error("[redirect] Redis GET error for slug %s:", slug, err);
  }

  // ── 2. Supabase fallback (cache miss) ─────────────────────────────────────
  if (!link) {
    try {
      const supabase = await createServiceClient();

      const { data, error } = await supabase
        .from("links")
        .select("destination_url, is_password_protected, expires_at")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return NextResponse.redirect(new URL("/link-not-found", base), { status: 302 });
      }

      link = {
        destinationUrl: data.destination_url,
        isPasswordProtected: data.is_password_protected,
        expiresAt: data.expires_at,
      };

      // Back-fill Redis so the next request is served from cache.
      void backfillCache(slug, link);
    } catch (err) {
      console.error("[redirect] Supabase lookup error for slug %s:", slug, err);
      // Fail open: show not-found rather than a 500 that exposes internals.
      return NextResponse.redirect(new URL("/link-not-found", base), { status: 302 });
    }
  }

  // ── 3. Expiry check ────────────────────────────────────────────────────────
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    // Delete the stale Redis key so it doesn't linger past expiry.
    void redis.del(`link:${slug}`).catch(() => {});
    return NextResponse.redirect(new URL("/expired", base), { status: 302 });
  }

  // ── 4. Password gate ────────────────────────────────────────────────────────
  if (link.isPasswordProtected) {
    return NextResponse.redirect(new URL(`/verify/${slug}`, base), { status: 302 });
  }

  // ── 5. Valid redirect ───────────────────────────────────────────────────────
  // Fire-and-forget — increment click counter without delaying the redirect.
  void trackClick(slug);

  return NextResponse.redirect(link.destinationUrl, { status: 307 });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Write a DB-fetched link back into Redis so future requests hit the cache.
 * Non-fatal: failure is logged and silently swallowed.
 */
async function backfillCache(slug: string, link: CachedLink): Promise<void> {
  const key = `link:${slug}`;
  const value = JSON.stringify(link);

  try {
    if (link.expiresAt) {
      const ttlSeconds = Math.max(
        1,
        Math.floor((new Date(link.expiresAt).getTime() - Date.now()) / 1000)
      );
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    console.error("[redirect] Redis backfill error for slug %s:", slug, err);
  }
}
