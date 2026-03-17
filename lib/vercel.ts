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
function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

/**
 * Verifies user projects against Vercel deployments.
 * Returns a map of project ID → deployment data for matched projects.
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
  try {
    deployments = await getVercelDeployments(token);
  } catch {
    return results;
  }

  // Only consider READY production deployments
  const readyDeployments = deployments.filter(
    (d) => d.state === "READY" && d.target === "production"
  );

  for (const project of projectsWithUrl) {
    const projectHostname = extractHostname(project.live_url!);

    const match = readyDeployments.find((d) => {
      const deployHostname = d.url.replace(/^https?:\/\//, "");
      return deployHostname === projectHostname || projectHostname === deployHostname;
    });

    if (match) {
      const deployedAt = match.readyAt
        ? new Date(match.readyAt).toISOString()
        : new Date(match.createdAt).toISOString();
      results.set(project.id, { latestDeployAt: deployedAt });
    }
  }

  return results;
}
