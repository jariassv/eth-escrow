export type ProjectStatus = "active" | "funded" | "failed";

export interface ProjectSummary {
  id: number;
  title: string;
  creator: string;
  description: string;
  tokenAddress: string;
  tokenSymbol: string;
  goalDisplay: string;
  raisedDisplay: string;
  goalUnits: string;
  raisedUnits: string;
  progress: number;
  deadline: Date;
  deadlineLabel: string;
  status: ProjectStatus;
  withdrawn: boolean;
  cancelled: boolean;
  pausedByCreator: boolean;
}

export interface ProjectDetail extends ProjectSummary {
  totalRefundedDisplay: string;
  totalRefundedUnits: string;
}
