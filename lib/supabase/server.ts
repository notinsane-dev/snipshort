import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/types";

// ---------------------------------------------------------------------------
// Three client types — pick the right one for each context:
//
//  createClient()        anon key + SSR cookies  → reads where RLS applies
//  createServiceClient() service role key         → bypasses RLS (privileged)
//  createUserClient()    anon key + Clerk JWT      → user-scoped writes/reads
//                                                   (auth.jwt() ->> 'sub') = Clerk user ID
//                                                   (NOT auth.uid() — it casts to ::uuid
//                                                   and breaks on Clerk's non-UUID IDs)
// ---------------------------------------------------------------------------

/**
 * Server-side Supabase client using the anon key and SSR cookie store.
 * Used by the session-refresh proxy and general server-side reads.
 * All queries are subject to Row Level Security.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot mutate cookies — middleware handles refresh.
          }
        },
      },
    }
  );
}

/**
 * Privileged server client using the service role key.
 * Bypasses ALL Row Level Security — use only for:
 *   - Atomic click-count increments (increment_link_clicks RPC)
 *   - Redirect handler slug lookups
 *   - Stats page reads (service role needed to read any row)
 *
 * NEVER use this for user-initiated writes (create/edit/delete links).
 * NEVER call this from client components or expose SUPABASE_SERVICE_ROLE_KEY.
 */
export async function createServiceClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Same reasoning as above.
          }
        },
      },
    }
  );
}

/**
 * User-scoped Supabase client bridging Clerk authentication to Supabase RLS.
 *
 * How it works:
 *   1. Retrieves a Supabase-scoped JWT from Clerk using the "supabase" JWT template.
 *   2. Passes it as `Authorization: Bearer <token>` to Supabase.
 *   3. Supabase verifies the token against Clerk's JWKS endpoint (configured in
 *      Supabase Dashboard → Authentication → Third-party providers → Clerk).
 *   4. `(auth.jwt() ->> 'sub')` inside RLS policies now returns the Clerk user
 *      ID string. (Avoid `auth.uid()` — it casts the claim to `::uuid`, which
 *      throws on Clerk's non-UUID IDs like "user_3GBg0d22...".)
 *
 * Use this for ALL user-initiated database operations:
 *   - Creating links (so user_id is set to the Clerk user ID via RLS)
 *   - Reading own links (dashboard)
 *   - Editing / deleting own links
 *
 * RLS is the authority for ownership — no application-level ownership check
 * is needed. A forged or mismatched JWT is rejected by Supabase's JWKS verification.
 *
 * Returns null if the user is not authenticated (no Clerk session).
 */
export async function createUserClient() {
  const { getToken, userId } = await auth();

  if (!userId) return null;

  const token = await getToken({ template: "supabase" });

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
      auth: {
        // Disable Supabase's own session management — Clerk owns the session.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
