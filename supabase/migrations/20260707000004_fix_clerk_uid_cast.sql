-- =============================================================================
-- Migration: fix_clerk_uid_cast
-- =============================================================================
-- Fixes: "invalid input syntax for type uuid: user_xxxxx" errors on every
-- query that hits an RLS policy using auth.uid().
--
-- ROOT CAUSE
--   Supabase's built-in auth.uid() function is defined roughly as:
--     select (auth.jwt() ->> 'sub')::uuid
--   It unconditionally casts the JWT "sub" claim to uuid. Clerk's user IDs
--   look like "user_3GBg0d22DTQntXm6Xomt5tf9Nc2" — not a valid UUID — so the
--   cast throws BEFORE our policy's own `::text` cast ever runs.
--
-- FIX
--   Replace every `auth.uid()::text` in RLS policies with
--   `(auth.jwt() ->> 'sub')`, which reads the same claim as plain text with
--   no UUID casting. This is the pattern Supabase recommends for any
--   third-party auth provider whose user IDs aren't UUIDs (Clerk, Auth0, etc).
--
-- Run in the Supabase SQL Editor, or via CLI: supabase db push
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Drop the policies that call auth.uid()
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "owners can select own links" ON public.links;
DROP POLICY IF EXISTS "owners can update own links" ON public.links;
DROP POLICY IF EXISTS "owners can delete own links" ON public.links;

-- ---------------------------------------------------------------------------
-- Recreate them using auth.jwt() ->> 'sub' instead of auth.uid()
-- ---------------------------------------------------------------------------

-- Authenticated users can SELECT their own links (dashboard).
CREATE POLICY "owners can select own links"
  ON public.links
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);

-- Only the owner can update their own links.
CREATE POLICY "owners can update own links"
  ON public.links
  FOR UPDATE
  TO authenticated
  USING  ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

-- Only the owner can delete their own links.
CREATE POLICY "owners can delete own links"
  ON public.links
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id);
