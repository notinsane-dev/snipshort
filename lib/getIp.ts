import type { NextRequest } from "next/server";

/**
 * Extract the real client IP from a Next.js request.
 *
 * Header priority (outermost proxy wins):
 *   1. x-forwarded-for  — set by Vercel, Cloudflare, most reverse proxies.
 *      May contain a comma-separated list; only the first (leftmost) value is
 *      the original client — the rest are intermediate proxies.
 *   2. x-real-ip        — set by Nginx and some CDNs as a single value.
 *   3. "127.0.0.1"      — safe fallback for local development where no
 *      proxy headers are present. All local requests share one bucket, which
 *      is fine for dev but means the limiter is effectively global locally.
 *
 * NOTE: x-forwarded-for can be spoofed by a client unless your infrastructure
 * (Cloudflare / Vercel) strips untrusted values before they reach your app.
 * On Vercel and Cloudflare Workers, the headers are injected by the platform
 * and client-supplied values are stripped, so this is safe in production.
 */
export function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // "client, proxy1, proxy2" — take only the first segment.
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
