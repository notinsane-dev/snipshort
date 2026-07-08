-- =============================================================================
-- Migration: increment_link_clicks_fn
-- =============================================================================
-- Adds the Postgres function used by lib/trackClick.ts to atomically
-- increment a link's click counter.
--
-- Run via Supabase SQL Editor, or version it with the CLI:
--   supabase migration new increment_link_clicks_fn
--   supabase db push
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Why a Postgres RPC instead of a JS-client UPDATE?
-- ---------------------------------------------------------------------------
-- The Supabase JS client has no direct equivalent of MongoDB's atomic $inc.
-- A naive read-then-write in application code would look like:
--
--   const { data } = await supabase.from('links').select('clicks').eq('slug', slug).single();
--   await supabase.from('links').update({ clicks: data.clicks + 1 }).eq('slug', slug);
--
-- This has a race condition: two simultaneous redirects could both read the
-- same value, both add 1, and write the same result — losing a count.
--
-- A single UPDATE ... SET clicks = clicks + 1 is atomic at the Postgres level:
-- no read step, no race, one round-trip.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_link_clicks(slug_input text)
RETURNS void
LANGUAGE sql
-- SECURITY DEFINER means the function runs as its owner (postgres / service
-- role), so it can UPDATE the row even when called by the anon role.
-- The service-role client in trackClick.ts already bypasses RLS, but
-- SECURITY DEFINER is a useful belt-and-suspenders for future policy changes.
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.links
  SET
    clicks          = clicks + 1,
    last_clicked_at = now()
  WHERE slug = slug_input;
$$;

-- Grant execute to authenticated and anon roles so the function is callable
-- via the Supabase JS client regardless of which key is used. The actual DB
-- mutation is protected by SECURITY DEFINER (runs as owner).
GRANT EXECUTE ON FUNCTION public.increment_link_clicks(text) TO anon, authenticated;


-- ---------------------------------------------------------------------------
-- TODO: click_events table (detailed analytics — build in a later phase)
-- ---------------------------------------------------------------------------
-- When you want per-click analytics (referrer, user-agent, geo), create:
--
-- CREATE TABLE public.click_events (
--   id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
--   slug           text        NOT NULL REFERENCES public.links(slug) ON DELETE CASCADE,
--   clicked_at     timestamptz NOT NULL DEFAULT now(),
--   referrer       text,
--   user_agent     text,
--   country        text        -- populated from CF-IPCountry header or ip-api.com
-- );
--
-- CREATE INDEX click_events_slug_idx ON public.click_events (slug);
-- CREATE INDEX click_events_clicked_at_idx ON public.click_events (clicked_at DESC);
--
-- Then extend increment_link_clicks (or create a second RPC) to INSERT a row
-- there alongside the UPDATE, keeping both in a single transaction.
-- ---------------------------------------------------------------------------
