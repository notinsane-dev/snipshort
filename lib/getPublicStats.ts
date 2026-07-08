import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export interface PublicStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
}

const FALLBACK: PublicStats = { totalLinks: 0, totalClicks: 0, activeLinks: 0 };

/**
 * Real, live aggregate stats for the homepage hero — backed by the
 * get_public_stats() Postgres function (see migrations/…_public_stats_fn.sql).
 * Never throws — falls back to zeros so the homepage always renders.
 *
 * Uses a plain, cookie-free service-role client (not createServiceClient()
 * from lib/supabase/server.ts) deliberately: that helper calls cookies()
 * from next/headers, which forces the whole route to render dynamically.
 * This is a public, cacheable aggregate query with no per-user data, so it
 * should be safe to prerender/ISR — pulling in cookies() would defeat that.
 */
export async function getPublicStats(): Promise<PublicStats> {
  try {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error } = await supabase.rpc("get_public_stats");

    if (error || !data?.[0]) {
      console.error("[getPublicStats] query failed:", error?.message);
      return FALLBACK;
    }

    const row = data[0];
    return {
      totalLinks: row.total_links ?? 0,
      totalClicks: row.total_clicks ?? 0,
      activeLinks: row.active_links ?? 0,
    };
  } catch (err) {
    console.error("[getPublicStats] unexpected error:", err);
    return FALLBACK;
  }
}
