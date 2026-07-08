import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

/**
 * Browser-side Supabase client.
 * Uses the anon key — all queries are subject to Row Level Security (RLS) policies.
 * Safe to expose in client components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
