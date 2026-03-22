import type { VercelDeployment, VercelProject, VercelTokenResponse, VercelUser } from "@/types/vercel";
import type { Tables } from "@/types/database";

const VERCEL_API = "https://api.vercel.com";

function vercelHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function getVercelProjects(token: string): Promise<VercelProject[]> {
  const res = await fetch(`${VERCEL_API}/v9/projects?limit=100`, {
    headers: vercelHeaders(token),
  });
  if (!res.ok) throw new Error(`Vercel API error: ${res.status}`);
  const json = (await res.json()) as { projects: VercelProject[] };
  return json.projects;
}

export async function getVercelDeployments(token: string): Promise<VercelDeployment[]> {
  const res = await fetch(`${VERCEL_API}/v6/deployments`, {
    headers: vercelHeaders(token),
  });
  if (!res.ok) throw new Error(`Vercel API error: ${res.status}`);
  const json = (await res.json()) as { deployments: VercelDeployment[] };
  return json.deployments;
}

/**
 * Returns the Vercel integration install URL.
 *
 * Vercel marketplace integrations (oac_ client IDs) do not support the
 * /oauth/authorize endpoint until the integration is published and approved.
 * For draft integrations, the install URL must be used instead. Vercel
 * passes `code` and `state` back to your Configuration URL identically.
 */
export function getOAuthAuthorizeUrl(state: string): string {
  const slug = process.env.VERCEL_INTEGRATION_SLUG!;
  const params = new URLSearchParams({ state });
  return `https://vercel.com/integrations/${slug}/new?${params.toString()}`;
}

/**
 * Exchanges an OAuth authorization code for an access token.
 */
export async function exchangeCodeForToken(code: string): Promise<VercelTokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.VERCEL_CLIENT_ID!,
    client_secret: process.env.VERCEL_CLIENT_SECRET!,
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/vercel/callback`,
  });

  const res = await fetch(`${VERCEL_API}/v2/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel token exchange failed (${res.status}): ${text}`);
  }

  return (await res.json()) as VercelTokenResponse;
}

/**
 * Fetches the authenticated Vercel user's profile.
 */
export async function getVercelUser(token: string): Promise<VercelUser> {
  const res = await fetch(`${VERCEL_API}/v2/user`, {
    headers: vercelHeaders(token),
  });
  if (!res.ok) throw new Error(`Vercel user fetch failed: ${res.status}`);
  const json = (await res.json()) as { user: VercelUser };
  return json.user;
}

/**
 * Extracts the hostname from a URL string.
 * e.g. "https://my-app.vercel.app" → "my-app.vercel.app"
 */
export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

/** Hostnames that differ only by leading `www.` are treated as the same site. */
export function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function deploymentUrlHostname(d: VercelDeployment): string | null {
  if (!d.url) return null;
  return d.url.replace(/^https?:\/\//, "").split("/")[0];
}

/**
 * Production aliases / URL from a Vercel project (custom domains live here;
 * deployment `url` is usually the hash URL, not the custom domain).
 */
function collectVercelProjectHostnames(vp: VercelProject): string[] {
  const hosts: string[] = [];
  const prod = vp.targets?.production;
  if (prod?.url) {
    const raw = prod.url.includes("://") ? prod.url : `https://${prod.url}`;
    hosts.push(extractHostname(raw));
  }
  if (prod?.alias?.length) {
    for (const a of prod.alias) {
      const raw = a.includes("://") ? a : `https://${a}`;
      hosts.push(extractHostname(raw));
    }
  }
  return hosts;
}

/**
 * Returns true when the live URL and a deployment or alias URL refer to the same host
 * (http/https, trailing slashes, and leading `www.` are normalized).
 */
export function matchLiveUrlToDeployment(liveUrl: string, deploymentUrl: string): boolean {
  return (
    normalizeHostname(extractHostname(liveUrl)) ===
    normalizeHostname(extractHostname(deploymentUrl))
  );
}

function deploymentTimestamp(d: VercelDeployment): number {
  return d.readyAt ?? d.createdAt ?? d.created;
}

function latestDeploymentTimestamp(deployments: VercelDeployment[]): string | null {
  const latest = [...deployments].sort(
    (a, b) => deploymentTimestamp(b) - deploymentTimestamp(a)
  )[0];

  if (!latest) return null;

  const timestamp = latest.readyAt ?? latest.createdAt ?? latest.created;
  return new Date(timestamp).toISOString();
}

function isReadyDeployment(d: VercelDeployment): boolean {
  return d.state === "READY" && Boolean(d.url);
}

function isLikelyProductionDeployment(d: VercelDeployment): boolean {
  return d.target === "production" || d.target === null;
}

/**
 * Verifies user projects against Vercel deployments.
 * Returns a map of project ID → deployment data for matched projects.
 *
 * Matches:
 * 1) Project live URL hostname to deployment `url` (e.g. *.vercel.app), or
 * 2) Project live URL hostname to any production alias on the Vercel project
 *    (custom domains such as www.example.com are only present on aliases, not on deployment.url).
 */
export async function verifyProjectsAgainstDeployments(
  token: string,
  projects: Pick<Tables<"projects">, "id" | "live_url">[]
): Promise<
  Map<
    string,
    { latestDeployAt: string | null }
  >
> {
  const results = new Map<string, { latestDeployAt: string | null }>();

  const projectsWithUrl = projects.filter((p) => p.live_url);
  if (projectsWithUrl.length === 0) return results;

  let deployments: VercelDeployment[];
  let vercelProjects: VercelProject[];
  try {
    [deployments, vercelProjects] = await Promise.all([
      getVercelDeployments(token),
      getVercelProjects(token),
    ]);
  } catch {
    return results;
  }

  const readyDeployments = deployments.filter(isReadyDeployment);
  const readyProductionDeployments = readyDeployments.filter(
    isLikelyProductionDeployment
  );

  for (const project of projectsWithUrl) {
    const projectHostname = extractHostname(project.live_url!);
    const projectNorm = normalizeHostname(projectHostname);

    // 1) Direct match: deployment URL hostname (e.g. project-abc123.vercel.app)
    // Vercel can return `target: null` for deployments that still back the
    // current production project/domain, so do not require an exact target match here.
    const directMatch = readyProductionDeployments.find((d) => {
      const h = deploymentUrlHostname(d);
      return h !== null && normalizeHostname(h) === projectNorm;
    });

    // 2) Stable project hostname / custom domain match. This is the most reliable
    // ownership signal for imported Vercel projects because the project record
    // carries the active production domains even when the deployment list is sparse.
    const vercelProject = vercelProjects.find((vp) =>
      collectVercelProjectHostnames(vp).some(
        (h) => normalizeHostname(h) === projectNorm
      )
    );

    let latestDeployAt: string | null = null;

    if (directMatch) {
      latestDeployAt = new Date(
        directMatch.readyAt ?? directMatch.createdAt ?? directMatch.created
      ).toISOString();
    } else if (vercelProject) {
      const projectDeployments = readyProductionDeployments.filter(
        (d) => d.projectId === vercelProject.id
      );

      latestDeployAt =
        latestDeploymentTimestamp(projectDeployments) ??
        latestDeploymentTimestamp(vercelProject.latestDeployments ?? []);
    }

    if (directMatch || vercelProject) {
      results.set(project.id, { latestDeployAt });
    }
  }

  return results;
}
