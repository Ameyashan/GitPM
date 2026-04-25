import { Company } from "./companies";
import {
  isPMRole,
  classifyRoleType,
  extractStackTags,
  parseGreenhouseSalary,
  inferRemote,
} from "./classify";

export interface ParsedJob {
  company_name: string;
  company_logo_url: string;
  role_title: string;
  role_type: string;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  stack_tags: string[];
  tools_tags: string[];
  apply_url: string;
  source: "greenhouse" | "ashby";
  source_id: string;
  posted_at: string | null;
}

// ── Greenhouse ────────────────────────────────────────────────────────────────

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  content: string;
  updated_at: string;
}

export async function fetchGreenhouse(company: Company): Promise<ParsedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const data: { jobs: GreenhouseJob[] } = await res.json();
  const results: ParsedJob[] = [];

  for (const job of data.jobs ?? []) {
    if (!isPMRole(job.title)) continue;

    const content = job.content ?? "";
    const { min, max } = parseGreenhouseSalary(content);
    const stackTags = extractStackTags(`${job.title} ${content}`);
    const remote = inferRemote(content, job.location?.name ?? "");

    results.push({
      company_name: company.name,
      company_logo_url: company.logoUrl,
      role_title: job.title,
      role_type: classifyRoleType(job.title),
      location: job.location?.name ?? null,
      remote,
      salary_min: min,
      salary_max: max,
      stack_tags: stackTags,
      tools_tags: [],
      apply_url: job.absolute_url,
      source: "greenhouse",
      source_id: String(job.id),
      posted_at: job.updated_at ?? null,
    });
  }

  return results;
}

// ── Ashby ─────────────────────────────────────────────────────────────────────

interface AshbyPosting {
  id: string;
  title: string;
  locationName: string;
  isRemote: boolean;
  compensation?: { compensationTierSummary?: string };
  applyLink: string;
  descriptionHtml: string;
  publishedAt: string;
  updatedAt: string;
}

export async function fetchAshby(company: Company): Promise<ParsedJob[]> {
  const url = `https://api.ashbyhq.com/posting-public/job-board/${company.slug}/listed`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];

  const data: { jobPostings?: AshbyPosting[] } = await res.json();
  const results: ParsedJob[] = [];

  for (const job of data.jobPostings ?? []) {
    if (!isPMRole(job.title)) continue;

    // Strip HTML tags for stack detection
    const plainText = job.descriptionHtml?.replace(/<[^>]+>/g, " ") ?? "";
    const { min, max } = parseGreenhouseSalary(
      job.compensation?.compensationTierSummary ?? plainText
    );
    const stackTags = extractStackTags(`${job.title} ${plainText}`);

    results.push({
      company_name: company.name,
      company_logo_url: company.logoUrl,
      role_title: job.title,
      role_type: classifyRoleType(job.title),
      location: job.locationName ?? null,
      remote: job.isRemote ?? inferRemote(plainText, job.locationName ?? ""),
      salary_min: min,
      salary_max: max,
      stack_tags: stackTags,
      tools_tags: [],
      apply_url: job.applyLink,
      source: "ashby",
      source_id: job.id,
      posted_at: job.publishedAt ?? job.updatedAt ?? null,
    });
  }

  return results;
}
