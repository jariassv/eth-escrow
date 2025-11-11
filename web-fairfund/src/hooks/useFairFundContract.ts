"use client";

import { useMemo } from "react";
import { JsonRpcProvider, BrowserProvider } from "ethers";
import { createFairFundContract } from "@/lib/contracts/fairfund";
import { env } from "@/lib/env";
import { useWalletStore } from "@/stores/wallet-store";

const defaultProvider = env.rpcUrl ? new JsonRpcProvider(env.rpcUrl) : undefined;

export const useFairFundContract = () => {
  const provider = useWalletStore((state) => state.provider);
  const signer = useWalletStore((state) => state.signer);

  return useMemo(() => {
    if (!env.fairFundAddress) {
      return {
        contract: null,
        contractWithSigner: null,
        runner: null,
        readOnlyProvider: null,
        isConfigured: false,
      };
    }

    const runner = provider ?? defaultProvider;

    if (!runner) {
      return {
        contract: null,
        contractWithSigner: null,
        runner: null,
        readOnlyProvider: null,
        isConfigured: false,
      };
    }

    const contract = createFairFundContract(runner as BrowserProvider | JsonRpcProvider);
    const contractWithSigner = signer ? contract.connect(signer) : null;
    const readOnlyProvider =
      runner instanceof BrowserProvider ? runner.provider : runner;

    return {
      contract,
      contractWithSigner,
      runner,
      readOnlyProvider,
      isConfigured: true,
    };
  }, [provider, signer]);
};

