-- =============================================================================
-- Migration: create_links_table
-- =============================================================================
-- Run this in the Supabase SQL Editor, or version it properly via the CLI:
--
--   supabase migration new create_links_table
--   # paste this content into the generated file under supabase/migrations/
--   supabase db push          # applies to your linked remote project
--   supabase db reset         # re-runs all migrations locally
--
-- The CLI approach is preferred for any real project — it gives you a numbered
-- migration history, allows rollbacks, and keeps local/remote in sync.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------

-- pg_cron enables scheduled SQL jobs (used for expired-link cleanup below).
-- Enable it once per project in Supabase: Dashboard → Database → Extensions.
-- Uncomment the line below only if you are running this outside the Dashboard
-- (the Dashboard enables it via the UI; running CREATE EXTENSION twice is
-- harmless but throws a notice).
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;


-- ---------------------------------------------------------------------------
-- 1. Table definition
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.links (

  -- Primary key
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The short slug, e.g. "aB3xY7z". Must be unique across all rows.
  -- NOTE: Postgres automatically creates a unique B-tree index on this column
  -- because of the UNIQUE constraint — no separate CREATE INDEX is needed.
  -- The index makes O(log n) slug lookups fast even at millions of rows.
  slug                text          NOT NULL UNIQUE,

  -- The long URL this slug redirects to.
  destination_url     text          NOT NULL,

  -- Timestamps
  created_at          timestamptz   NOT NULL DEFAULT now(),

  -- Expiry timestamp. NULL means the link never expires.
  -- IMPORTANT — Postgres vs MongoDB TTL difference (see section 4 below):
  -- MongoDB supports a native TTL index that auto-deletes documents when a
  -- date field passes a threshold. Postgres has no equivalent; rows are never
  -- deleted automatically. Instead:
  --   (a) At read time, the redirect handler checks expires_at < now() and
  --       returns 410 Gone without performing the redirect.
  --   (b) A background job (pg_cron, see section 5) physically deletes expired
  --       rows on a schedule to keep the table from growing unboundedly.
  -- This two-step approach is deliberate: step (a) gives instant expiry with
  -- zero lag; step (b) keeps storage clean.
  expires_at          timestamptz,

  -- Redirect counter. Incremented server-side via the service-role client to
  -- bypass RLS (regular users cannot UPDATE this column).
  clicks              integer       NOT NULL DEFAULT 0,

  last_clicked_at     timestamptz,

  -- Optional link to a Supabase auth user. NULL for anonymous/public links.
  -- Used in a later phase to power per-user dashboards and ownership checks.
  user_id             uuid          REFERENCES auth.users (id) ON DELETE SET NULL,

  -- Password protection
  is_password_protected boolean     NOT NULL DEFAULT false,
  -- bcrypt hash of the password. Never store plaintext.
  password_hash       text,

  -- Future: per-link custom domains (e.g. go.yourbrand.com/slug)
  custom_domain       text,

  -- Optional human-readable label shown in the dashboard
  title               text

);


-- ---------------------------------------------------------------------------
-- 2. Indexes
-- ---------------------------------------------------------------------------

-- slug is already indexed automatically by the UNIQUE constraint above.
-- This comment exists so future maintainers don't add a redundant index.

-- expires_at index: used by both the cleanup cron job and any query that
-- filters on expiry (e.g. "show me all links expiring in the next 24 hours").
-- Without this index, those queries do a full sequential scan of the table.
-- A partial index (WHERE expires_at IS NOT NULL) is more efficient because
-- the majority of rows may have NULL expiry and can be skipped entirely.
CREATE INDEX IF NOT EXISTS links_expires_at_idx
  ON public.links (expires_at)
  WHERE expires_at IS NOT NULL;

-- Optional: index on user_id for fast per-user dashboard queries.
-- Uncomment once user auth is wired up.
-- CREATE INDEX IF NOT EXISTS links_user_id_idx ON public.links (user_id);


-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- With RLS enabled and no policies defined, Postgres defaults to DENY ALL —
-- no role (including anon) can read or write any row. The policies below open
-- only the minimum surface area required for the current (pre-auth) phase.


-- ---------------------------------------------------------------------------
-- 4. RLS Policies — pre-auth phase
-- ---------------------------------------------------------------------------
--
-- TRADEOFF EXPLANATION:
-- RLS in Postgres is ROW-level only — you cannot hide individual columns with
-- a policy the way you might with a VIEW or a GraphQL schema. If you want the
-- public to read some columns (slug, destination_url) but not others
-- (password_hash, user_id), the correct pattern is:
--   (a) Create a restricted VIEW that exposes only the safe columns, or
--   (b) Keep SELECT locked to service-role only and let your API layer
--       project only the columns you want to return to the client.
-- We use approach (b) for now: the Next.js Route Handler fetches the full row
-- via the service-role client and then returns only what the client needs.
-- This keeps the schema simple and avoids VIEW maintenance overhead until the
-- auth phase introduces real per-user ownership checks.
--
-- CURRENT POLICIES:
--   - INSERT: open to `anon` role so unauthenticated users can create links.
--   - SELECT / UPDATE / DELETE: restricted to service-role only (no policy
--     needed — service-role bypasses RLS by default in Supabase).
-- ---------------------------------------------------------------------------

-- Allow anonymous visitors to shorten a URL.
CREATE POLICY "anon can insert links"
  ON public.links
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow the authenticated role to insert as well (logged-in users).
CREATE POLICY "authenticated can insert links"
  ON public.links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow the public to SELECT a single row by slug so the redirect Route
-- Handler can resolve a link without needing the service-role key.
-- Intentionally narrow: no full-table scan for anonymous users.
CREATE POLICY "public can select by slug"
  ON public.links
  FOR SELECT
  TO anon, authenticated
  USING (true);
-- NOTE: Column-level filtering (hiding password_hash etc.) must be done in
-- the application layer since RLS cannot restrict individual columns.


-- ---------------------------------------------------------------------------
-- 4b. Future ownership-based policies (COMMENTED OUT — enable in auth phase)
-- ---------------------------------------------------------------------------
--
-- Once user_id is populated on insert and auth.uid() is available, replace
-- the blanket SELECT/UPDATE/DELETE blocks above with these:
--
-- -- Users can see their own links
-- CREATE POLICY "owners can select own links"
--   ON public.links
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);
--
-- -- Users can update their own links
-- CREATE POLICY "owners can update own links"
--   ON public.links
--   FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
--
-- -- Users can delete their own links
-- CREATE POLICY "owners can delete own links"
--   ON public.links
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = user_id);
--
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- 5. Expired-link cleanup via pg_cron
-- ---------------------------------------------------------------------------
--
-- MONGO TTL vs POSTGRES pg_cron — why this section exists:
--
-- MongoDB TTL indexes (db.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }))
-- are a first-class database feature: MongoDB's background thread scans the
-- index every ~60 seconds and physically removes expired documents with no
-- application code required.
--
-- Postgres has no equivalent. Rows are never deleted automatically regardless
-- of their column values. The two-part strategy we use instead:
--
--   Part A — Instant expiry at READ time (app-layer):
--     The redirect Route Handler checks `expires_at < now()` and returns
--     410 Gone before redirecting. This is immediate with zero cron lag.
--
--   Part B — Physical deletion on a SCHEDULE (database-layer):
--     pg_cron runs a DELETE every hour to reclaim storage and keep index
--     scans fast. Without this, expired rows accumulate forever and bloat
--     the table even though they are never served to users.
--
-- To enable: go to Supabase Dashboard → Database → Extensions → pg_cron → Enable.
-- Then run the SELECT below once to register the job.
-- The cron schedule '0 * * * *' means "at minute 0 of every hour".
--
-- Run this ONCE after enabling the pg_cron extension:

SELECT cron.schedule(
  'delete-expired-links',        -- unique job name (idempotent if re-run)
  '0 * * * *',                   -- every hour on the hour
  $$
    DELETE FROM public.links
    WHERE expires_at IS NOT NULL
      AND expires_at < now();
  $$
);

-- To verify the job was registered:
--   SELECT * FROM cron.job;
--
-- To remove the job:
--   SELECT cron.unschedule('delete-expired-links');
--
-- Why pg_cron over a Supabase Edge Function on a schedule?
--   - pg_cron runs INSIDE the database — no network round-trip, no cold starts,
--     no separate deployment. For a simple DELETE it is the right tool.
--   - Edge Functions are better suited for cleanup that needs application logic
--     (e.g. sending "your link expired" emails before deleting) — use one then
--     if you need that, and have it call this same DELETE internally.
