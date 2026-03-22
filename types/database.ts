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
          medium_url: string | null;
          substack_url: string | null;
          youtube_url: string | null;
          twitter_url: string | null;
          github_contributions: Json | null;
          github_contributions_synced_at: string | null;
          profile_view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          headline?: string;
          bio?: string | null;
          avatar_url?: string | null;
          github_username?: string | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          medium_url?: string | null;
          substack_url?: string | null;
          youtube_url?: string | null;
          twitter_url?: string | null;
          github_contributions?: Json | null;
          github_contributions_synced_at?: string | null;
          profile_view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          headline?: string;
          bio?: string | null;
          avatar_url?: string | null;
          github_username?: string | null;
          linkedin_url?: string | null;
          website_url?: string | null;
          medium_url?: string | null;
          substack_url?: string | null;
          youtube_url?: string | null;
          twitter_url?: string | null;
          github_contributions?: Json | null;
          github_contributions_synced_at?: string | null;
          profile_view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          name: string;
          description?: string;
          live_url: string;
          github_repo_url?: string | null;
          thumbnail_url?: string | null;
          demo_video_url?: string | null;
          build_tools?: string[];
          hosting_platform?: string | null;
          tech_stack?: string[];
          category_tags?: string[];
          problem_statement?: string;
          target_user?: string | null;
          key_decisions?: string | null;
          learnings?: string | null;
          metrics_text?: string | null;
          commit_count?: number | null;
          first_commit_at?: string | null;
          latest_deploy_at?: string | null;
          is_solo?: boolean;
          is_verified?: boolean;
          verification_method?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          name?: string;
          description?: string;
          live_url?: string;
          github_repo_url?: string | null;
          thumbnail_url?: string | null;
          demo_video_url?: string | null;
          build_tools?: string[];
          hosting_platform?: string | null;
          tech_stack?: string[];
          category_tags?: string[];
          problem_statement?: string;
          target_user?: string | null;
          key_decisions?: string | null;
          learnings?: string | null;
          metrics_text?: string | null;
          commit_count?: number | null;
          first_commit_at?: string | null;
          latest_deploy_at?: string | null;
          is_solo?: boolean;
          is_verified?: boolean;
          verification_method?: string | null;
          display_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          provider_user_id: string;
          access_token: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          provider_username?: string | null;
          connected_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          provider_user_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          provider_username?: string | null;
          connected_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connected_accounts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      screenshots: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "screenshots_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          emoji: string | null;
          body: string | null;
          page_label: string;
          path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          emoji?: string | null;
          body?: string | null;
          page_label: string;
          path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          emoji?: string | null;
          body?: string | null;
          page_label?: string;
          path?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_profile_view: {
        Args: { p_user_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
