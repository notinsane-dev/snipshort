import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Upstash Redis client (HTTP REST — edge-compatible)
// ---------------------------------------------------------------------------
// @upstash/ratelimit uses @upstash/redis (REST over HTTPS), NOT ioredis.
// Both point to the same Upstash database but via different protocols:
//   - ioredis  (lib/redis.ts)   → TCP, used for slug caching in Node runtime
//   - @upstash/redis             → HTTPS REST, used here for rate limiting
//     (works in both Node and Edge runtimes, required by @upstash/ratelimit)
//
// If UPSTASH_REDIS_REST_URL / TOKEN are not set (e.g. local dev without
// Upstash), the helper in lib/getIp.ts returns a bypass signal and the
// route handlers skip the check — see note in those files.

function createUpstashRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const upstash = createUpstashRedis();

// ---------------------------------------------------------------------------
// Rate limiters
// ---------------------------------------------------------------------------
//
// Cloudflare Turnstile vs rate limiting — complementary layers:
//
//   Turnstile (bot challenge at the UI level)
//     → Stops automated form submissions before they ever hit the API.
//       A bot that can't solve the challenge never reaches /api/shorten.
//       Best defence against high-volume scraping bots.
//
//   Rate limiting (API level, applied per IP)
//     → Stops abuse that DOES reach the API: human-driven scripts,
//       curl loops, clients that bypass the UI entirely, and any attacker
//       who solved or skipped Turnstile. Rate limiting is the last line of
//       defence and the only protection on /api/verify/[slug] (which has
//       no associated form widget).
//
//   Use both together: Turnstile raises the cost of each attempt;
//   rate limiting caps the total number regardless of Turnstile status.
//
// Algorithm: Sliding Window — more accurate than fixed windows because it
// doesn't allow a burst at the boundary of two fixed windows. A client
// can't fire 5 requests at 00:59 and 5 more at 01:01 to get 10 in 2 seconds.

/**
 * POST /api/shorten — 5 requests per 60 seconds per IP.
 * Generous enough for real use; tight enough to block bulk creation.
 */
export const shortenRatelimit: Ratelimit | null = upstash
  ? new Ratelimit({
      redis: upstash,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "rl:shorten",
      analytics: false,
    })
  : null;

/**
 * POST /api/verify/[slug] — 10 requests per 60 seconds per IP.
 *
 * Higher than shorten because a single user might visit several protected
 * links in quick succession; but still tight enough to make brute-forcing
 * a bcrypt hash computationally infeasible within any reasonable window.
 *
 * For extra hardening, consider a compound key of IP + slug
 * (see applyRatelimit usage in the verify route).
 */
export const verifyRatelimit: Ratelimit | null = upstash
  ? new Ratelimit({
      redis: upstash,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "rl:verify",
      analytics: false,
    })
  : null;
