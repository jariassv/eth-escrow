"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

export const WalletButton = () => {
  const { address, status, error, connect, disconnect } = useWallet();

  const label = useMemo(() => {
    if (status === "connecting") return "Conectando...";
    if (status === "connected" && address) return truncateAddress(address);
    if (error) return "Reintentar";
    return "Conectar wallet";
  }, [status, address, error]);

  const handleClick = () => {
    if (status === "connected") {
      disconnect();
      return;
    }
    void connect();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={status === "connected" ? "outline" : "primary"}
        onClick={handleClick}
        isLoading={status === "connecting"}
      >
        {label}
      </Button>
      {error && (
        <span className="text-xs text-red-500">
          {error === "No se detectó una wallet compatible con EIP-1193."
            ? "Instala MetaMask u otra wallet compatible."
            : error}
        </span>
      )}
    </div>
  );
};

