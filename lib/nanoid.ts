import { customAlphabet } from "nanoid";

// ---------------------------------------------------------------------------
// Alphabet
// ---------------------------------------------------------------------------
// Excludes visually ambiguous characters so slugs are easy to read, type,
// and transcribe — especially when printed on QR code labels or spoken aloud:
//   0  ↔  O  (zero vs capital-oh)
//   1  ↔  l  ↔  I  (one vs lowercase-L vs capital-i)
const ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

// 7 characters from a 55-char alphabet → 55^7 ≈ 1.15 trillion combinations.
// At 10 million links the collision probability is still negligible (<0.01%).
const DEFAULT_LENGTH = 7;

const nanoid = customAlphabet(ALPHABET, DEFAULT_LENGTH);

// ---------------------------------------------------------------------------
// Reserved words
// ---------------------------------------------------------------------------
// These slugs are blocked for custom user input because they collide with
// existing or planned routes/endpoints in the app. Extend this list freely —
// it is intentionally kept as a plain array rather than a Set so it is easy
// to read and diff in code review.
const RESERVED_SLUGS: string[] = [
  "r",           // /r/[slug] — internal redirect route
  "api",         // /api/* — all API routes
  "shorten",     // /api/shorten endpoint word
  "admin",       // future admin panel
  "dashboard",   // /dashboard — user link dashboard (Clerk-protected)
  "sign-in",     // /sign-in — Clerk sign-in page
  "sign-up",     // /sign-up — Clerk sign-up page
  "login",       // common auth alias
  "logout",
  "signup",
  "register",
  "verify",      // /verify/[slug] — password gate
  "stats",       // /stats/[slug] — analytics page
  "app",         // generic catch-all worth reserving
  "health",      // /api/health or similar monitoring routes
  "favicon",
  "robots",
  "sitemap",
  "static",
  "_next",       // Next.js internal prefix
];

// Pre-compute a lower-cased Set for O(1) lookups at validation time.
const RESERVED_SET = new Set(RESERVED_SLUGS.map((w) => w.toLowerCase()));

// ---------------------------------------------------------------------------
// Custom-slug validation regex
// ---------------------------------------------------------------------------
// Allowed characters: a-z, A-Z, 0-9, hyphens, underscores.
// Length: 3–30 characters.
// Anchored (^ … $) so partial matches don't slip through.
const CUSTOM_SLUG_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Generate a random, collision-resistant URL slug.
 *
 * @param length - character count (default: 7)
 * @returns A slug using the unambiguous alphabet defined above.
 */
export function generateSlug(length = DEFAULT_LENGTH): string {
  return nanoid(length);
}

/**
 * Validate a user-supplied custom slug.
 *
 * Rules:
 *  - 3–30 characters long
 *  - Only alphanumeric characters, hyphens (`-`), and underscores (`_`)
 *  - Case-insensitively not in the reserved-words list
 *
 * @param slug - The raw string the user wants to use as their short-link slug.
 * @returns `true` if the slug is acceptable, `false` otherwise.
 */
export function isValidCustomSlug(slug: string): boolean {
  if (!CUSTOM_SLUG_REGEX.test(slug)) {
    return false;
  }
  if (RESERVED_SET.has(slug.toLowerCase())) {
    return false;
  }
  return true;
}
