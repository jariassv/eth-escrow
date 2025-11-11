"use client";

import { useState, useCallback } from "react";
import { Contract, parseUnits } from "ethers";
import { useQueryClient } from "@tanstack/react-query";

import { useWallet } from "@/hooks/useWallet";
import { useFairFundContract } from "@/hooks/useFairFundContract";
import { getTokenMetadata } from "@/lib/token-metadata";
import { env } from "@/lib/env";
import { formatTokenAmount } from "@/lib/utils";

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
] as const;

type ActionStatus = "idle" | "pending" | "success" | "error";

export const useProjectActions = (projectId: number, tokenAddress: string) => {
  const queryClient = useQueryClient();
  const { address } = useWallet();
  const { contractWithSigner, readOnlyProvider } = useFairFundContract();
  const [fundStatus, setFundStatus] = useState<ActionStatus>("idle");
  const [refundStatus, setRefundStatus] = useState<ActionStatus>("idle");
  const [withdrawStatus, setWithdrawStatus] = useState<ActionStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const runInvalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["fairfund-projects"] });
    void queryClient.invalidateQueries({ queryKey: ["fairfund-project", projectId] });
  }, [queryClient, projectId]);

  const fund = useCallback(
    async (amountInput: string) => {
      if (!contractWithSigner || !address) {
        setFundStatus("error");
        setMessage("Conecta tu wallet para aportar.");
        return;
      }

      try {
        setFundStatus("pending");
        setMessage(null);

        const metadataRunner = readOnlyProvider ?? contractWithSigner.runner;
        if (!metadataRunner) {
          throw new Error("No existe un provider configurado para leer metadatos.");
        }

        const metadata = await getTokenMetadata(tokenAddress, metadataRunner);
        const amount = parseUnits(amountInput, metadata.decimals);

        const signerRunner = contractWithSigner.runner;
        if (!signerRunner) {
          throw new Error("La wallet conectada no permite firmar transacciones.");
        }

        const erc20 = new Contract(tokenAddress, ERC20_ABI, signerRunner);
        const allowance: bigint = await erc20.allowance(address, env.fairFundAddress);
        if (allowance < amount) {
          const approveTx = await erc20.approve(env.fairFundAddress, amount);
          await approveTx.wait();
        }

        const balance: bigint = await erc20.balanceOf(address);
        if (balance < amount) {
          throw new Error("Saldo insuficiente para aportar la cantidad seleccionada.");
        }

        const tx = await contractWithSigner.fundProject(projectId, amount);
        await tx.wait();

        setFundStatus("success");
        setMessage(
          `Aporte realizado correctamente (${formatTokenAmount(
            amount,
            metadata.decimals,
            metadata.symbol
          ).formatted}).`
        );
        runInvalidate();
      } catch (error) {
        console.error("[fundProject]", error);
        const message =
          error instanceof Error ? error.message : "No se pudo completar el aporte.";
        setFundStatus("error");
        setMessage(message);
      }
    },
    [contractWithSigner, address, projectId, tokenAddress, readOnlyProvider, runInvalidate]
  );

  const refund = useCallback(async () => {
    if (!contractWithSigner) {
      setRefundStatus("error");
      setMessage("Conecta tu wallet para solicitar un reembolso.");
      return;
    }

    try {
      setRefundStatus("pending");
      setMessage(null);
      const tx = await contractWithSigner.refund(projectId);
      await tx.wait();
      setRefundStatus("success");
      setMessage("Reembolso ejecutado correctamente.");
      runInvalidate();
    } catch (error) {
      console.error("[refund]", error);
      const message =
        error instanceof Error ? error.message : "No se pudo completar el reembolso.";
      setRefundStatus("error");
      setMessage(message);
    }
  }, [contractWithSigner, projectId, runInvalidate]);

  const withdraw = useCallback(async () => {
    if (!contractWithSigner) {
      setWithdrawStatus("error");
      setMessage("Conecta tu wallet para retirar fondos.");
      return;
    }

    try {
      setWithdrawStatus("pending");
      setMessage(null);
      const tx = await contractWithSigner.withdrawFunds(projectId);
      await tx.wait();
      setWithdrawStatus("success");
      setMessage("Fondos retirados correctamente.");
      runInvalidate();
    } catch (error) {
      console.error("[withdraw]", error);
      const message =
        error instanceof Error ? error.message : "No se pudo completar el retiro.";
      setWithdrawStatus("error");
      setMessage(message);
    }
  }, [contractWithSigner, projectId, runInvalidate]);

  return {
    fund,
    refund,
    withdraw,
    fundStatus,
    refundStatus,
    withdrawStatus,
    message,
  };
};
