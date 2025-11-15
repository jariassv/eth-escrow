"use client";

import { useQuery } from "@tanstack/react-query";
import { useFairFundContract } from "./useFairFundContract";

interface FairFundContributionContract {
  getContribution: (
    projectId: number,
    backer: string
  ) => Promise<{ amount: bigint; refunded: bigint }>;
}

export const useUserContribution = (projectId: number, userAddress?: string | null) => {
  const { contract, runner, isConfigured } = useFairFundContract();

  return useQuery({
    queryKey: ["fairfund-user-contribution", projectId, userAddress],
    enabled:
      Boolean(userAddress) &&
      Boolean(contract) &&
      Boolean(runner) &&
      isConfigured &&
      projectId > 0,
    queryFn: async () => {
      if (!userAddress || !contract || !runner) {
        return { amount: 0n, refunded: 0n };
      }

      const fairFund = contract as unknown as FairFundContributionContract;
      try {
        const contribution = await fairFund.getContribution(projectId, userAddress);
        return {
          amount: contribution.amount ?? 0n,
          refunded: contribution.refunded ?? 0n,
        };
      } catch (error) {
        console.warn("[useUserContribution]", error);
        return { amount: 0n, refunded: 0n };
      }
    },
    staleTime: 15_000,
  });
};

