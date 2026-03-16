export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  link?: {
    type: "github" | "gitlab" | "bitbucket";
    repo: string;
    repoId: number;
    org: string;
  };
  latestDeployments?: VercelDeployment[];
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: "BUILDING" | "ERROR" | "INITIALIZING" | "QUEUED" | "READY" | "CANCELED";
  target: "production" | "preview" | null;
  createdAt: number;
  readyAt?: number;
  projectId: string;
  meta?: {
    githubCommitSha?: string;
    githubCommitRef?: string;
    githubRepo?: string;
  };
}

export interface VercelTokenResponse {
  access_token: string;
  token_type: string;
  team_id: string | null;
  user_id: string;
  installation_id: string;
}

export interface VercelUser {
  id: string;
  username: string;
  name: string;
  email: string;
}
