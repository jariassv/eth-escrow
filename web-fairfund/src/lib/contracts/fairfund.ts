import type { ContractRunner } from "ethers";
import { Contract, JsonRpcProvider } from "ethers";
import FairFundArtifact from "../../../lib/abi/FairFund.json";
import { env } from "../env";

type ArtifactShape = {
  abi: unknown;
};

const artifact = FairFundArtifact as ArtifactShape | unknown[];

export const FAIR_FUND_ABI: unknown[] =
  Array.isArray(artifact) || !artifact
    ? (artifact as unknown[])
    : ((artifact as ArtifactShape).abi as unknown[]) ?? [];

const fallbackProvider = () =>
  env.rpcUrl ? new JsonRpcProvider(env.rpcUrl) : undefined;

export const createFairFundContract = (runner?: ContractRunner | null) => {
  if (!env.fairFundAddress) {
    throw new Error(
      "Variable NEXT_PUBLIC_FAIRFUND_ADDRESS no configurada en el entorno."
    );
  }

  const contractRunner = runner ?? fallbackProvider();

  if (!contractRunner) {
    throw new Error(
      "No se encontró un provider válido para inicializar el contrato FairFund."
    );
  }

  return new Contract(env.fairFundAddress, FAIR_FUND_ABI, contractRunner);
};

