import { createServiceClient } from "@/lib/supabase/server";

/**
 * Fire-and-forget click counter increment.
 *
 * Calls the `increment_link_clicks` Postgres RPC, which executes:
 *
 *   UPDATE links
 *   SET clicks = clicks + 1, last_clicked_at = now()
 *   WHERE slug = slug_input;
 *
 * in a single atomic statement — no read/write race condition.
 *
 * USAGE — always call without await so it never delays a redirect:
 *
 *   void trackClick(slug);
 *
 * The function deliberately swallows all errors. A failed analytics write
 * must never degrade or block the user's redirect experience.
 *
 * TODO: when detailed per-click analytics are needed, extend this function
 * to also INSERT a row into a `click_events` table (referrer, user_agent,
 * country from CF-IPCountry / ip-api.com). The SQL scaffold for that table
 * is in supabase/migrations/20260707000002_increment_link_clicks_fn.sql.
 */
export async function trackClick(slug: string): Promise<void> {
  try {
    // Service-role client bypasses RLS — necessary because click increments
    // are a privileged server-side write that regular users must not be able
    // to trigger directly via the anon key.
    const supabase = await createServiceClient();

    const { error } = await supabase.rpc("increment_link_clicks", {
      slug_input: slug,
    });

    if (error) {
      console.error("[trackClick] RPC error for slug %s: %s", slug, error.message);
    }
  } catch (err) {
    // Network outage, Supabase unavailable, etc. — log and continue.
    console.error("[trackClick] unexpected error for slug %s:", slug, err);
  }
}
