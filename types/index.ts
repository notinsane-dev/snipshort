/**
 * ---------------------------------------------------------------------------
 * Re-export the Supabase-generated Database type
 * ---------------------------------------------------------------------------
 * The source of truth is types/supabase.ts.
 *
 * To regenerate after a schema change:
 *   npm run gen:types
 *   (set your real project ID in the "gen:types" script in package.json first)
 *
 * Nothing else in the app should import directly from types/supabase.ts —
 * always import from types/index.ts so refactors stay in one place.
 * ---------------------------------------------------------------------------
 */
export type { Database } from "./supabase";
export type { Json } from "./supabase";

import type { Database } from "./supabase";

// ---------------------------------------------------------------------------
// Convenience row types derived from the generated Database type.
// These update automatically whenever types/supabase.ts is regenerated —
// no manual sync required.
// ---------------------------------------------------------------------------

/** A full row from the `links` table as returned by SELECT queries. */
export type Link = Database["public"]["Tables"]["links"]["Row"];

/**
 * The shape accepted by Supabase INSERT operations on `links`.
 * All columns with DB defaults (id, created_at, clicks, …) are optional.
 */
export type LinkInsert = Database["public"]["Tables"]["links"]["Insert"];

/**
 * The shape accepted by Supabase UPDATE operations on `links`.
 * Every column is optional — pass only what you want to change.
 */
export type LinkUpdate = Database["public"]["Tables"]["links"]["Update"];

// ---------------------------------------------------------------------------
// API / application-layer interfaces (not tied to a DB row)
// ---------------------------------------------------------------------------

/** Payload accepted by POST /api/shorten */
export interface ShortenRequest {
  url: string;
  custom_slug?: string;
  password?: string;
  expires_at?: string;
}

/** Response shape returned by POST /api/shorten */
export interface ShortenResponse {
  slug: string;
  short_url: string;
}

/** Click analytics record. */
export interface ClickEvent {
  id: string;
  slug: string;
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
}
