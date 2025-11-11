export type ProjectStatus = "active" | "funded" | "failed";

export interface ProjectSummary {
  id: number;
  title: string;
  creator: string;
  description: string;
  goal: string;
  deadline: string;
  tokenSymbol: string;
  raised: string;
  backers: number;
  status: ProjectStatus;
}

export interface Contribution {
  projectId: number;
  amount: string;
  tokenSymbol: string;
  timestamp: string;
}

