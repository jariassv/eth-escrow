"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddress, type ContractRunner } from "ethers";
import { useFairFundContract } from "./useFairFundContract";
import { getTokenMetadata } from "@/lib/token-metadata";
import { formatDate, formatTokenAmount } from "@/lib/utils";
import type { ProjectDetail, ProjectStatus, ProjectSummary } from "@/types/project";

const deriveStatus = (
  project: RawProject,
  deadlineSeconds: number
): ProjectStatus => {
  if (project.cancelled) return "failed";
  if (project.withdrawn) return "funded";
  if (project.totalRaised >= project.goal) return "funded";
  if (deadlineSeconds <= Math.floor(Date.now() / 1000)) return "failed";
  return "active";
};

const normalizeAddress = (value: string) => {
  try {
    return getAddress(value);
  } catch {
    return value;
  }
};

type RawProject = {
  creator: string;
  tokenAddress: string;
  title: string;
  descriptionURI: string;
  goal: bigint;
  deadline: bigint;
  totalRaised: bigint;
  totalRefunded: bigint;
  withdrawn: boolean;
  cancelled: boolean;
  pausedByCreator: boolean;
};

type FairFundReadContract = {
  projectCount: () => Promise<bigint>;
  getProjects: (offset: number, limit: number) => Promise<RawProject[]>;
  getProject: (id: number) => Promise<RawProject>;
};

const toSummary = async (
  project: RawProject,
  id: number,
  metadataRunner: ContractRunner
): Promise<ProjectSummary> => {
  const deadlineSeconds = Number(project.deadline ?? 0n);
  const { date, formatted } = formatDate(deadlineSeconds);
  const { symbol, decimals } = await getTokenMetadata(
    project.tokenAddress,
    metadataRunner
  );

  const goal = formatTokenAmount(project.goal ?? 0n, decimals, symbol);
  const raised = formatTokenAmount(project.totalRaised ?? 0n, decimals, symbol);

  const progress =
    goal.numeric && goal.numeric > 0 && raised.numeric
      ? Math.min(raised.numeric / goal.numeric, 1)
      : 0;

  return {
    id,
    title: project.title,
    creator: normalizeAddress(project.creator),
    description: project.descriptionURI,
    tokenAddress: normalizeAddress(project.tokenAddress),
    tokenSymbol: symbol,
    goalDisplay: goal.formatted,
    raisedDisplay: raised.formatted,
    goalUnits: goal.units,
    raisedUnits: raised.units,
    progress,
    deadline: date,
    deadlineLabel: formatted,
    status: deriveStatus(project, deadlineSeconds),
    withdrawn: project.withdrawn,
    cancelled: project.cancelled,
    pausedByCreator: project.pausedByCreator,
  };
};

const toDetail = async (
  project: RawProject,
  id: number,
  metadataRunner: ContractRunner
): Promise<ProjectDetail> => {
  const summary = await toSummary(project, id, metadataRunner);
  const { symbol, decimals } = await getTokenMetadata(
    project.tokenAddress,
    metadataRunner
  );
  const refunded = formatTokenAmount(
    project.totalRefunded ?? 0n,
    decimals,
    symbol
  );
  return {
    ...summary,
    totalRefundedDisplay: refunded.formatted,
    totalRefundedUnits: refunded.units,
  };
};

export const useProjects = () => {
  const { contract, isConfigured, runner } = useFairFundContract();

  return useQuery({
    queryKey: ["fairfund-projects"],
    enabled: Boolean(contract) && isConfigured,
    queryFn: async () => {
      if (!contract || !runner) return [];

      const fairFund = contract as unknown as FairFundReadContract;
      const total = Number(await fairFund.projectCount());
      if (total === 0) return [];

      const projects = await fairFund.getProjects(0, total);
      return Promise.all(
        projects.map((project, index) =>
          toSummary(project, index + 1, runner)
        )
      );
    },
    staleTime: 15_000,
  });
};

export const useProject = (id: number) => {
  const { contract, isConfigured, runner } = useFairFundContract();

  return useQuery({
    queryKey: ["fairfund-project", id],
    enabled: Boolean(contract) && Boolean(runner) && isConfigured && id > 0,
    queryFn: async () => {
      if (!contract || !runner) {
        throw new Error("Contrato FairFund no configurado.");
      }

      const fairFund = contract as unknown as FairFundReadContract;
      const project = await fairFund.getProject(id);
      return toDetail(project, id, runner);
    },
    staleTime: 15_000,
  });
};

