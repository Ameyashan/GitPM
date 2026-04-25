export type RoleType = "PM" | "APM" | "Senior PM" | "Staff" | "FDE";

const PM_TITLE_PATTERNS = [
  /product\s+manager/i,
  /\bPM\b/,
  /\bAPM\b/,
  /associate\s+product/i,
  /forward\s+deployed/i,
  /\bFDE\b/,
  /field\s+(deployment|development|demo)\s+engineer/i,
];

export function isPMRole(title: string): boolean {
  return PM_TITLE_PATTERNS.some((p) => p.test(title));
}

export function classifyRoleType(title: string): RoleType {
  const t = title.toLowerCase();

  if (/\bapm\b|associate\s+product/.test(t)) return "APM";

  if (
    /forward\s+deployed|field\s+(deployment|development|demo)\s+engineer|\bfde\b/.test(t)
  )
    return "FDE";

  if (
    /\bstaff\b|\bprincipal\b|group\s+product|director\s+of\s+product/.test(t)
  )
    return "Staff";

  if (/\bsenior\b|\bsr\.?\b/.test(t)) return "Senior PM";

  return "PM";
}

const STACK_KEYWORDS: string[] = [
  // Languages
  "Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "Ruby", "Swift", "Kotlin", "Scala", "C++",
  // Frontend
  "React", "Vue", "Angular", "Next.js", "Svelte", "GraphQL", "REST", "WebSocket",
  // Backend
  "Node.js", "Django", "FastAPI", "Rails", "Spring", "Express",
  // Data
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Snowflake", "dbt", "Spark", "Kafka",
  // Cloud
  "AWS", "GCP", "Azure", "Vercel", "Cloudflare",
  // AI/ML
  "LLM", "GPT", "Claude", "OpenAI", "PyTorch", "TensorFlow", "RAG", "Hugging Face", "Embeddings",
  // DevTools
  "Docker", "Kubernetes", "Terraform", "GitHub", "CI/CD",
  // Product tools
  "Figma", "Amplitude", "Mixpanel", "Segment", "Datadog", "Looker", "PostHog",
  // Payments/infra
  "Stripe", "Twilio", "Salesforce",
  // Concepts
  "API", "Microservices", "Distributed Systems", "Mobile", "iOS", "Android",
];

const KEYWORD_PATTERN = new RegExp(
  `\\b(${STACK_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi"
);

export function extractStackTags(text: string): string[] {
  const matches = text.match(KEYWORD_PATTERN) ?? [];
  const normalized = matches.map((m) => {
    // Normalize casing to match our canonical list
    const lower = m.toLowerCase();
    return STACK_KEYWORDS.find((k) => k.toLowerCase() === lower) ?? m;
  });
  return Array.from(new Set(normalized));
}

export function parseGreenhouseSalary(
  content: string
): { min: number | null; max: number | null } {
  // Requires leading $ to avoid matching non-salary ranges (e.g. "12–20 years")
  const m = content.match(
    /\$([\d,]+)k?\s*[-–]\s*\$?([\d,]+)k?/i
  );
  if (!m) return { min: null, max: null };
  const parse = (s: string, isK: boolean) => {
    const n = parseInt(s.replace(/,/g, ""), 10);
    return isK || n < 10000 ? n * 1000 : n;
  };
  const hasK = /k/i.test(m[0]);
  return { min: parse(m[1], hasK), max: parse(m[2], hasK) };
}

export function inferRemote(text: string, location: string): boolean {
  const combined = `${text} ${location}`.toLowerCase();
  return /\bremote\b/.test(combined);
}
