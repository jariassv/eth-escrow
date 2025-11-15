"use client";

import { useQuery } from "@tanstack/react-query";
import { useFairFundContract } from "@/hooks/useFairFundContract";
import { getTokenMetadata } from "@/lib/token-metadata";
import { formatTokenAmount } from "@/lib/utils";
import type { ProjectSummary } from "@/types/project";

interface FairFundContributionContract {
  getContribution: (
    projectId: number,
    backer: string
  ) => Promise<{ amount: bigint; refunded: bigint }>;
}

export type ContributionEntry = {
  projectId: number;
  title: string;
  status: ProjectSummary["status"];
  tokenSymbol: string;
  tokenAddress: string;
  amount: bigint;
  refunded: bigint;
  contributedDisplay: string;
  refundedDisplay: string;
};

export const useContributionHistory = (
  address?: string | null,
  projects?: ProjectSummary[]
) => {
  const { contract, runner, isConfigured } = useFairFundContract();

  return useQuery({
    queryKey: ["fairfund-contribution-history", address, projects?.length],
    enabled:
      Boolean(address) &&
      Boolean(contract) &&
      Boolean(runner) &&
      isConfigured &&
      Boolean(projects?.length),
    queryFn: async () => {
      if (!address || !contract || !runner || !projects?.length) return [] as ContributionEntry[];

      const fairFund = contract as unknown as FairFundContributionContract;
      const entries: ContributionEntry[] = [];

      for (const project of projects) {
        try {
          const contribution = await fairFund.getContribution(project.id, address);
          if (contribution.amount > 0n) {
            const metadata = await getTokenMetadata(project.tokenAddress, runner);
            const contributed = formatTokenAmount(
              contribution.amount,
              metadata.decimals,
              metadata.symbol
            );
            const refunded = formatTokenAmount(
              contribution.refunded,
              metadata.decimals,
              metadata.symbol
            );

            entries.push({
              projectId: project.id,
              title: project.title,
              status: project.status,
              tokenSymbol: metadata.symbol,
              tokenAddress: project.tokenAddress,
              amount: contribution.amount,
              refunded: contribution.refunded,
              contributedDisplay: contributed.formatted,
              refundedDisplay: refunded.formatted,
            });
          }
        } catch (error) {
          console.warn("[useContributionHistory]", project.id, error);
        }
      }

      return entries;
    },
    staleTime: 15000,
  });
};
