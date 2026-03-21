import { z } from "zod";

export const BUILD_TOOLS = [
  "cursor",
  "lovable",
  "v0",
  "bolt",
  "replit",
] as const;

export const HOSTING_PLATFORMS = [
  "vercel",
  "lovable",
  "github_pages",
  "netlify",
  "other",
] as const;

export const CATEGORY_TAGS = [
  "saas",
  "dashboard",
  "landing-page",
  "mobile",
  "api",
  "tool",
  "e-commerce",
  "ai",
  "productivity",
  "social",
  "data",
  "other",
] as const;

// Accepts non-empty valid URLs or empty/null (normalized to null)
const optionalUrl = z
  .string()
  .nullable()
  .optional()
  .refine(
    (v) => !v || v.startsWith("http://") || v.startsWith("https://"),
    "Must be a valid URL starting with http:// or https://"
  );

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(80, "Slug too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .default(""),
  live_url: z
    .string()
    .min(1, "Live URL is required")
    .refine(
      (v) => v.startsWith("http://") || v.startsWith("https://"),
      "Must be a valid URL starting with http:// or https://"
    ),
  category_tags: z.array(z.string()).default([]),
  build_tools: z.array(z.string()).default([]),
  hosting_platform: z.string().nullable().optional(),
  problem_statement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters")
    .max(2000, "Problem statement too long"),
  target_user: z.string().max(500).nullable().optional(),
  key_decisions: z.string().max(2000).nullable().optional(),
  learnings: z.string().max(2000).nullable().optional(),
  demo_video_url: optionalUrl,
  github_repo_url: optionalUrl,
  metrics_text: z.string().max(500).nullable().optional(),
  is_published: z.boolean().optional().default(true),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  display_order: z.number().int().optional(),
  is_published: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  verification_method: z.string().nullable().optional(),
});

export const projectReorderSchema = z.array(
  z.object({
    id: z.string().uuid(),
    display_order: z.number().int().min(0),
  })
);

// Step-level schemas for client-side form validation
export const step1Schema = z.object({
  name: z.string().min(1, "Project name is required").max(80, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(80, "Slug too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase, numbers, and hyphens only"
    ),
  description: z.string().max(500, "Max 500 characters").optional(),
  live_url: z
    .string()
    .min(1, "Live URL is required")
    .refine(
      (v) => v.startsWith("http://") || v.startsWith("https://"),
      "Must start with http:// or https://"
    ),
  category_tags: z.array(z.string()).optional(),
});

export const step2Schema = z.object({
  build_tools: z
    .array(z.string())
    .min(1, "Select at least one build tool"),
  hosting_platform: z.string().nullable().optional(),
});

export const step3Schema = z.object({
  problem_statement: z
    .string()
    .min(10, "Problem statement must be at least 10 characters")
    .max(2000, "Too long"),
  target_user: z.string().max(500).optional(),
  key_decisions: z.string().max(2000).optional(),
  learnings: z.string().max(2000).optional(),
});

export const step4Schema = z.object({
  demo_video_url: optionalUrl,
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
