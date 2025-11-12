"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contract } from "ethers";

import { useFairFundContract } from "@/hooks/useFairFundContract";
import { env } from "@/lib/env";
import { getTokenMetadata } from "@/lib/token-metadata";
import { formatTokenAmount } from "@/lib/utils";

const ERC20_BALANCE_ABI = ["function balanceOf(address owner) view returns (uint256)"] as const;

export type WalletTokenBalance = {
  address: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  formatted: string;
};

export const useWalletBalances = (walletAddress?: string | null) => {
  const { runner } = useFairFundContract();

  const supportedTokensSignature = useMemo(
    () => JSON.stringify(env.supportedTokens ?? []),
    []
  );

  return useQuery({
    queryKey: ["wallet-balances", walletAddress, supportedTokensSignature],
    enabled:
      Boolean(walletAddress) &&
      Boolean(runner) &&
      Array.isArray(env.supportedTokens) &&
      env.supportedTokens.length > 0,
    queryFn: async () => {
      if (!walletAddress || !runner) return [] as WalletTokenBalance[];

      const results = await Promise.all(
        env.supportedTokens.map(async (token) => {
          const contract = new Contract(token.address, ERC20_BALANCE_ABI, runner);

          try {
            const balance: bigint = await contract.balanceOf(walletAddress);

            const metadata =
              token.decimals != null
                ? { symbol: token.symbol, decimals: token.decimals }
                : await getTokenMetadata(token.address, runner);

            const display = formatTokenAmount(balance, metadata.decimals, metadata.symbol);

            return {
              address: token.address,
              symbol: metadata.symbol,
              decimals: metadata.decimals,
              balance,
              formatted: display.formatted,
            };
          } catch (error) {
            console.warn("[useWalletBalances] error fetching balance", token.address, error);
            return {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals ?? 18,
              balance: 0n,
              formatted: `0 ${token.symbol}`,
            };
          }
        })
      );

      return results as WalletTokenBalance[];
    },
    staleTime: 15_000,
  });
};


