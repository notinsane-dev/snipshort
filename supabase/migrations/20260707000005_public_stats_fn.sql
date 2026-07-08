-- =============================================================================
-- Migration: public_stats_fn
-- =============================================================================
-- Adds a single Postgres function that returns aggregate, public-safe stats
-- for the homepage hero (total links, total redirects, active links).
--
-- Doing this as one RPC call (instead of three separate count/sum queries
-- from the JS client) means one round-trip and one sequential scan instead
-- of three, and avoids exposing any row-level data (destination_url,
-- password_hash, etc.) — only aggregate counts leave the database.
--
-- Run in the Supabase SQL Editor, or via CLI: supabase db push
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE (
  total_links   bigint,
  total_clicks  bigint,
  active_links  bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*)                                                            AS total_links,
    coalesce(sum(clicks), 0)                                            AS total_clicks,
    count(*) FILTER (WHERE expires_at IS NULL OR expires_at > now())    AS active_links
  FROM public.links;
$$;

-- Anyone can call this — it only ever returns three aggregate numbers,
-- never row-level data, so it's safe for anon (unauthenticated homepage visitors).
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
