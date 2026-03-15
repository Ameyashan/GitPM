// Vercel API helpers — implemented in Ticket 6
// Uses access_token from connected_accounts table

import type { VercelDeployment, VercelProject } from "@/types/vercel";

const VERCEL_API = "https://api.vercel.com";

function vercelHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function getVercelProjects(token: string): Promise<VercelProject[]> {
  const res = await fetch(`${VERCEL_API}/v9/projects`, {
    headers: vercelHeaders(token),
  });
  if (!res.ok) throw new Error(`Vercel API error: ${res.status}`);
  const json = (await res.json()) as { projects: VercelProject[] };
  return json.projects;
}

export async function getVercelDeployments(
  token: string
): Promise<VercelDeployment[]> {
  const res = await fetch(`${VERCEL_API}/v6/deployments`, {
    headers: vercelHeaders(token),
  });
  if (!res.ok) throw new Error(`Vercel API error: ${res.status}`);
  const json = (await res.json()) as { deployments: VercelDeployment[] };
  return json.deployments;
}

export async function getOAuthAuthorizeUrl(state: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.VERCEL_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/vercel/callback`,
    state,
  });
  return `https://vercel.com/oauth/authorize?${params.toString()}`;
}
