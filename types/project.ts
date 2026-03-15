import type { Database } from "./database";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type ConnectedAccount =
  Database["public"]["Tables"]["connected_accounts"]["Row"];
export type Screenshot = Database["public"]["Tables"]["screenshots"]["Row"];

export type BuildTool = "cursor" | "lovable" | "v0" | "bolt" | "replit";
export type HostingPlatform =
  | "vercel"
  | "lovable"
  | "github_pages"
  | "netlify"
  | "other";
export type VerificationMethod =
  | "vercel_oauth"
  | "lovable_repo"
  | "github_pages";

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
