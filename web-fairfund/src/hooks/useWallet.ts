"use client";

import { useCallback, useEffect } from "react";
import {
  BrowserProvider,
  JsonRpcSigner,
  getAddress,
  type Eip1193Provider,
} from "ethers";
import { useWalletStore } from "@/stores/wallet-store";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        listener: (...args: unknown[]) => void
      ) => void;
    };
  }
}

const getBrowserProvider = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No se detectó una wallet compatible con EIP-1193.");
  }
  return new BrowserProvider(window.ethereum);
};

const normalizeAddress = (value: string) => {
  try {
    return getAddress(value);
  } catch {
    return value;
  }
};

export const useWallet = () => {
  const state = useWalletStore((store) => store);

  const connect = useCallback(async () => {
    const { setConnecting, setConnected, setError } = useWalletStore.getState();
    try {
      setConnecting();
      const provider = getBrowserProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No se recibió ninguna cuenta de la wallet.");
      }
      const signer: JsonRpcSigner = await provider.getSigner();
      const network = await provider.getNetwork();
      setConnected({
        address: normalizeAddress(accounts[0]),
        chainId: Number(network.chainId),
        provider,
        signer,
        network,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error conectando wallet.";
      setError(message);
      console.error("[useWallet] connect error:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    useWalletStore.getState().reset();
  }, []);

  const checkExistingConnection = useCallback(async () => {
    const { setConnected } = useWalletStore.getState();
    try {
      const provider = getBrowserProvider();
      const accounts = await provider.listAccounts();
      if (!accounts || accounts.length === 0) return;
      const signer: JsonRpcSigner = await provider.getSigner();
      const network = await provider.getNetwork();
      setConnected({
        address: normalizeAddress(accounts[0].address),
        chainId: Number(network.chainId),
        provider,
        signer,
        network,
      });
    } catch {
      // Silent fail; no need to log on initial load.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    void checkExistingConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        useWalletStore.getState().reset();
        return;
      }
      const { provider } = useWalletStore.getState();
      if (!provider) return;
      void Promise.all([provider.getNetwork(), provider.getSigner()]).then(
        ([network, signer]) => {
          useWalletStore.getState().setConnected({
            address: normalizeAddress(accounts[0]),
            chainId: Number(network.chainId),
            provider,
            signer,
            network,
          });
        }
      );
    };

    const handleChainChanged = (chainId: string) => {
      const decimalId = Number.parseInt(chainId, 16);
      useWalletStore.setState((prev) => ({
        ...prev,
        chainId: Number.isFinite(decimalId) ? decimalId : prev.chainId,
      }));
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [checkExistingConnection]);

  return {
    ...state,
    connect,
    disconnect,
  };
};

