"use client";

import { BrowserProvider, JsonRpcSigner, Network } from "ethers";
import { create } from "zustand";

export type WalletStatus = "idle" | "connecting" | "connected" | "error";

export interface WalletState {
  address: string | null;
  chainId: number | null;
  status: WalletStatus;
  error?: string;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

interface WalletActions {
  setConnecting: () => void;
  setConnected: (
    params: {
      address: string;
      chainId: number;
      provider: BrowserProvider;
      signer: JsonRpcSigner;
    } & { network?: Network }
  ) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState: WalletState = {
  address: null,
  chainId: null,
  status: "idle",
  provider: null,
  signer: null,
};

export const useWalletStore = create<WalletState & WalletActions>((set) => ({
  ...initialState,
  setConnecting: () =>
    set({
      status: "connecting",
      error: undefined,
    }),
  setConnected: ({ address, chainId, provider, signer }) =>
    set({
      address,
      chainId,
      provider,
      signer,
      status: "connected",
      error: undefined,
    }),
  setError: (error) =>
    set({
      status: "error",
      error,
    }),
  reset: () => set(initialState),
}));

