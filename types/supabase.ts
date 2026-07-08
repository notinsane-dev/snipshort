/**
 * ⚠️  AUTO-GENERATED — DO NOT EDIT BY HAND
 *
 * Regenerate whenever the database schema changes:
 *
 *   npm run gen:types
 *
 * Requirements:
 *   1. Supabase CLI installed (npm i -g supabase  OR  npx supabase …)
 *   2. Logged in: npx supabase login
 *   3. Replace <your-project-id> in the package.json "gen:types" script
 *      with your real project ID (found in Supabase Dashboard → Settings → General).
 *
 * The file below is a hand-written stub that exactly mirrors the shape the
 * CLI would emit for the `links` table defined in the migration.
 * Once you run `npm run gen:types` for the first time this file will be
 * fully overwritten with the authoritative machine-generated version.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      links: {
        Row: {
          id: string;
          slug: string;
          destination_url: string;
          created_at: string;
          expires_at: string | null;
          clicks: number;
          last_clicked_at: string | null;
          user_id: string | null;
          is_password_protected: boolean;
          password_hash: string | null;
          custom_domain: string | null;
          title: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          destination_url: string;
          created_at?: string;
          expires_at?: string | null;
          clicks?: number;
          last_clicked_at?: string | null;
          user_id?: string | null;
          is_password_protected?: boolean;
          password_hash?: string | null;
          custom_domain?: string | null;
          title?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          destination_url?: string;
          created_at?: string;
          expires_at?: string | null;
          clicks?: number;
          last_clicked_at?: string | null;
          user_id?: string | null;
          is_password_protected?: boolean;
          password_hash?: string | null;
          custom_domain?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_link_clicks: {
        Args: { slug_input: string };
        Returns: void;
      };
      get_public_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_links: number;
          total_clicks: number;
          active_links: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
