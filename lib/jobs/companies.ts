export type ATSSource = "greenhouse" | "ashby";

export interface Company {
  name: string;
  logoUrl: string;
  source: ATSSource;
  slug: string;
}

export const COMPANIES: Company[] = [
  // Greenhouse
  { name: "Anthropic", logoUrl: "https://logo.clearbit.com/anthropic.com", source: "greenhouse", slug: "anthropic" },
  { name: "OpenAI", logoUrl: "https://logo.clearbit.com/openai.com", source: "greenhouse", slug: "openai" },
  { name: "Stripe", logoUrl: "https://logo.clearbit.com/stripe.com", source: "greenhouse", slug: "stripe" },
  { name: "Figma", logoUrl: "https://logo.clearbit.com/figma.com", source: "greenhouse", slug: "figma" },
  { name: "Notion", logoUrl: "https://logo.clearbit.com/notion.so", source: "greenhouse", slug: "notion" },
  { name: "Replit", logoUrl: "https://logo.clearbit.com/replit.com", source: "greenhouse", slug: "replit" },
  { name: "Perplexity", logoUrl: "https://logo.clearbit.com/perplexity.ai", source: "greenhouse", slug: "perplexity" },
  { name: "Scale AI", logoUrl: "https://logo.clearbit.com/scale.com", source: "greenhouse", slug: "scaleai" },
  { name: "Databricks", logoUrl: "https://logo.clearbit.com/databricks.com", source: "greenhouse", slug: "databricks" },
  { name: "Airtable", logoUrl: "https://logo.clearbit.com/airtable.com", source: "greenhouse", slug: "airtable" },
  { name: "Retool", logoUrl: "https://logo.clearbit.com/retool.com", source: "greenhouse", slug: "retool" },
  { name: "Amplitude", logoUrl: "https://logo.clearbit.com/amplitude.com", source: "greenhouse", slug: "amplitude" },
  { name: "Cloudflare", logoUrl: "https://logo.clearbit.com/cloudflare.com", source: "greenhouse", slug: "cloudflare" },
  { name: "Grafana Labs", logoUrl: "https://logo.clearbit.com/grafana.com", source: "greenhouse", slug: "grafanalabs" },
  { name: "Weights & Biases", logoUrl: "https://logo.clearbit.com/wandb.ai", source: "greenhouse", slug: "wandb" },
  { name: "Cohere", logoUrl: "https://logo.clearbit.com/cohere.com", source: "greenhouse", slug: "cohere" },
  { name: "Character AI", logoUrl: "https://logo.clearbit.com/character.ai", source: "greenhouse", slug: "characterai" },
  { name: "Together AI", logoUrl: "https://logo.clearbit.com/together.ai", source: "greenhouse", slug: "togetherai" },
  // Ashby
  { name: "Linear", logoUrl: "https://logo.clearbit.com/linear.app", source: "ashby", slug: "linear" },
  { name: "Vercel", logoUrl: "https://logo.clearbit.com/vercel.com", source: "ashby", slug: "vercel" },
  { name: "PostHog", logoUrl: "https://logo.clearbit.com/posthog.com", source: "ashby", slug: "posthog" },
  { name: "Supabase", logoUrl: "https://logo.clearbit.com/supabase.com", source: "ashby", slug: "supabase" },
  { name: "Cursor", logoUrl: "https://logo.clearbit.com/cursor.sh", source: "ashby", slug: "anysphere" },
  { name: "Hugging Face", logoUrl: "https://logo.clearbit.com/huggingface.co", source: "ashby", slug: "huggingface" },
  { name: "Sierra", logoUrl: "https://logo.clearbit.com/sierra.ai", source: "ashby", slug: "sierra" },
  { name: "Mistral", logoUrl: "https://logo.clearbit.com/mistral.ai", source: "ashby", slug: "mistral" },
  { name: "Loom", logoUrl: "https://logo.clearbit.com/loom.com", source: "ashby", slug: "loom" },
  { name: "Fly.io", logoUrl: "https://logo.clearbit.com/fly.io", source: "ashby", slug: "fly" },
  { name: "Descript", logoUrl: "https://logo.clearbit.com/descript.com", source: "ashby", slug: "descript" },
  { name: "Mintlify", logoUrl: "https://logo.clearbit.com/mintlify.com", source: "ashby", slug: "mintlify" },
];
