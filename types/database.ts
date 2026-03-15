// Auto-generated Supabase types — regenerate with:
// npx supabase gen types typescript --project-id <project-id> > types/database.ts
// This file is a placeholder until migrations are run in Ticket 2.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          headline: string;
          bio: string | null;
          avatar_url: string | null;
          github_username: string | null;
          linkedin_url: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["users"]["Row"],
              "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          name: string;
          description: string;
          live_url: string;
          github_repo_url: string | null;
          thumbnail_url: string | null;
          demo_video_url: string | null;
          build_tools: string[];
          hosting_platform: string | null;
          tech_stack: string[];
          category_tags: string[];
          problem_statement: string;
          target_user: string | null;
          key_decisions: string | null;
          learnings: string | null;
          metrics_text: string | null;
          commit_count: number | null;
          first_commit_at: string | null;
          latest_deploy_at: string | null;
          is_solo: boolean;
          is_verified: boolean;
          verification_method: string | null;
          display_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["projects"]["Row"],
          "id" | "created_at" | "updated_at" | "is_verified" | "is_published"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["projects"]["Row"],
              "id" | "created_at" | "updated_at" | "is_verified" | "is_published"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      connected_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_user_id: string;
          access_token: string;
          refresh_token: string | null;
          token_expires_at: string | null;
          provider_username: string | null;
          connected_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["connected_accounts"]["Row"],
          "id" | "connected_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["connected_accounts"]["Row"],
              "id" | "connected_at"
            >
          >;
        Update: Partial<
          Database["public"]["Tables"]["connected_accounts"]["Insert"]
        >;
      };
      screenshots: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["screenshots"]["Row"],
          "id" | "created_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["screenshots"]["Row"],
              "id" | "created_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["screenshots"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
