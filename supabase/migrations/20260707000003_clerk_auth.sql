-- =============================================================================
-- Migration: clerk_auth
-- =============================================================================
-- Bridges Clerk authentication with Supabase RLS by:
--   1. Converting user_id from uuid (Supabase Auth) to text (Clerk user IDs
--      look like "user_2abc123..." — not UUIDs).
--   2. Replacing the blanket pre-auth RLS policies with ownership-based ones
--      that read (auth.jwt() ->> 'sub') — the Clerk user ID — thanks to the
--      Third-Party Auth setup in Supabase Dashboard. (NOT auth.uid(): that
--      helper casts the sub claim to ::uuid and breaks on Clerk's IDs.)
--
-- PREREQUISITE — complete these steps in the dashboards BEFORE running this:
--
--   Clerk Dashboard:
--     Configure → JWT Templates → New → "Supabase" preset → name it "supabase"
--     Copy the JWKS Endpoint URL shown on the template page.
--
--   Supabase Dashboard:
--     Authentication → Sign In Methods → Third-party providers → Add provider
--     → Clerk → paste JWKS Endpoint URL → Save.
--
--   After the above, Supabase trusts Clerk-issued JWTs and
--   auth.uid() returns the Clerk user ID ("user_2abc...") inside RLS policies.
--
-- Run in the Supabase SQL Editor, or via CLI: supabase db push
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Drop the FK constraint that tied user_id to auth.users
-- ---------------------------------------------------------------------------
-- auth.users is Supabase Auth's own user table. We are replacing Supabase Auth
-- with Clerk, so the foreign key is no longer valid or useful.

ALTER TABLE public.links
  DROP CONSTRAINT IF EXISTS links_user_id_fkey;


-- ---------------------------------------------------------------------------
-- 2. Change user_id column type from uuid → text
-- ---------------------------------------------------------------------------
-- Clerk user IDs are strings, not UUIDs. The existing NULL values are
-- preserved; the cast of NULL::uuid → text is safe in Postgres.

ALTER TABLE public.links
  ALTER COLUMN user_id TYPE text
  USING user_id::text;


-- ---------------------------------------------------------------------------
-- 3. Drop the old pre-auth blanket RLS policies
-- ---------------------------------------------------------------------------
-- These were intentionally permissive placeholders. Replace them with
-- ownership-scoped policies below.

DROP POLICY IF EXISTS "anon can insert links"         ON public.links;
DROP POLICY IF EXISTS "authenticated can insert links" ON public.links;
DROP POLICY IF EXISTS "public can select by slug"      ON public.links;


-- ---------------------------------------------------------------------------
-- 4. New ownership-based RLS policies
-- ---------------------------------------------------------------------------

-- 4a. Anyone (even unauthenticated visitors) can create a short link.
--     user_id will be NULL for anonymous links.
CREATE POLICY "anyone can insert links"
  ON public.links
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4b. Authenticated users can SELECT their own links (for the dashboard).
--     NOTE: use (auth.jwt() ->> 'sub'), NOT auth.uid() — Supabase's auth.uid()
--     casts the JWT "sub" claim to ::uuid internally, which throws on Clerk's
--     non-UUID user IDs (e.g. "user_3GBg0d22..."). Reading the claim directly
--     as text avoids that cast entirely.
CREATE POLICY "owners can select own links"
  ON public.links
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- 4c. Public (anon) can SELECT a row by slug so the redirect Route Handler
--     can resolve links without needing the service-role key.
--     The Route Handler's application layer is responsible for not leaking
--     sensitive columns (password_hash, etc.) to the client.
CREATE POLICY "public can select link by slug"
  ON public.links
  FOR SELECT
  TO anon
  USING (true);

-- 4d. Only the owner can update their own links.
CREATE POLICY "owners can update own links"
  ON public.links
  FOR UPDATE
  TO authenticated
  USING  ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

-- 4e. Only the owner can delete their own links.
CREATE POLICY "owners can delete own links"
  ON public.links
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);


-- ---------------------------------------------------------------------------
-- 5. Index on user_id for fast per-user dashboard queries
-- ---------------------------------------------------------------------------
-- Now that user_id is text and actively used for filtering, an index matters.

CREATE INDEX IF NOT EXISTS links_user_id_idx
  ON public.links (user_id)
  WHERE user_id IS NOT NULL;


-- ---------------------------------------------------------------------------
-- Notes on the service-role client
-- ---------------------------------------------------------------------------
-- createServiceClient() in lib/supabase/server.ts bypasses ALL RLS policies.
-- It is still used for:
--   - Redirect handler: slug lookups where we don't want to rely on anon SELECT
--   - Click tracking: atomic UPDATE via increment_link_clicks() RPC
--   - Stats page: reading any link row for display
--
-- It is NOT used for:
--   - POST /api/shorten (uses createUserClient so user_id is set via auth.uid())
--   - PATCH / DELETE /api/links/[id] (uses createUserClient so RLS enforces ownership)
