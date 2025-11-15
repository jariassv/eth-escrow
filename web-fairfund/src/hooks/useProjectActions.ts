"use client";

import { useState, useCallback } from "react";
import { Contract, parseUnits } from "ethers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
        toast.error("Wallet no conectada", {
          description: "Conecta tu wallet para poder aportar al proyecto.",
        });
        return;
      }

      try {
        setFundStatus("pending");
        setMessage(null);
        const loadingToast = toast.loading("Procesando aporte...", {
          description: "Preparando la transacción",
        });

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
          toast.loading("Aprobando token...", {
            id: loadingToast,
            description: "Necesitamos tu aprobación para transferir tokens",
          });
          const approveTx = await erc20.approve(env.fairFundAddress, amount);
          await approveTx.wait();
          toast.loading("Token aprobado. Enviando aporte...", {
            id: loadingToast,
            description: "Confirmando la transacción",
          });
        }

        const balance: bigint = await erc20.balanceOf(address);
        if (balance < amount) {
          throw new Error("Saldo insuficiente para aportar la cantidad seleccionada.");
        }

        const tx = await contractWithSigner.fundProject(projectId, amount);
        toast.loading("Transacción enviada", {
          id: loadingToast,
          description: `Esperando confirmación... Hash: ${tx.hash.slice(0, 10)}...`,
        });
        await tx.wait();

        const formatted = formatTokenAmount(amount, metadata.decimals, metadata.symbol).formatted;
        setFundStatus("success");
        setMessage(`Aporte realizado correctamente (${formatted}).`);
        toast.success("Aporte realizado exitosamente", {
          id: loadingToast,
          description: `Has aportado ${formatted} al proyecto.`,
        });
        runInvalidate();
      } catch (error) {
        console.error("[fundProject]", error);
        const errorMessage =
          error instanceof Error ? error.message : "No se pudo completar el aporte.";
        setFundStatus("error");
        setMessage(errorMessage);
        toast.error("Error al realizar el aporte", {
          description: errorMessage,
        });
      }
    },
    [contractWithSigner, address, projectId, tokenAddress, readOnlyProvider, runInvalidate]
  );

  const refund = useCallback(async () => {
    if (!contractWithSigner) {
      setRefundStatus("error");
      toast.error("Wallet no conectada", {
        description: "Conecta tu wallet para solicitar un reembolso.",
      });
      return;
    }

    try {
      setRefundStatus("pending");
      setMessage(null);
      const loadingToast = toast.loading("Procesando reembolso...", {
        description: "Preparando la transacción",
      });
      const tx = await contractWithSigner.refund(projectId);
      toast.loading("Transacción enviada", {
        id: loadingToast,
        description: `Esperando confirmación... Hash: ${tx.hash.slice(0, 10)}...`,
      });
      await tx.wait();
      setRefundStatus("success");
      setMessage("Reembolso ejecutado correctamente.");
      toast.success("Reembolso exitoso", {
        id: loadingToast,
        description: "Tu reembolso ha sido procesado correctamente.",
      });
      runInvalidate();
    } catch (error) {
      console.error("[refund]", error);
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo completar el reembolso.";
      setRefundStatus("error");
      setMessage(errorMessage);
      toast.error("Error al solicitar reembolso", {
        description: errorMessage,
      });
    }
  }, [contractWithSigner, projectId, runInvalidate]);

  const withdraw = useCallback(async () => {
    if (!contractWithSigner) {
      setWithdrawStatus("error");
      toast.error("Wallet no conectada", {
        description: "Conecta tu wallet para retirar fondos.",
      });
      return;
    }

    try {
      setWithdrawStatus("pending");
      setMessage(null);
      const loadingToast = toast.loading("Procesando retiro...", {
        description: "Preparando la transacción",
      });
      const tx = await contractWithSigner.withdrawFunds(projectId);
      toast.loading("Transacción enviada", {
        id: loadingToast,
        description: `Esperando confirmación... Hash: ${tx.hash.slice(0, 10)}...`,
      });
      await tx.wait();
      setWithdrawStatus("success");
      setMessage("Fondos retirados correctamente.");
      toast.success("Fondos retirados exitosamente", {
        id: loadingToast,
        description: "Los fondos han sido transferidos a tu wallet.",
      });
      runInvalidate();
    } catch (error) {
      console.error("[withdraw]", error);
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo completar el retiro.";
      setWithdrawStatus("error");
      setMessage(errorMessage);
      toast.error("Error al retirar fondos", {
        description: errorMessage,
      });
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
