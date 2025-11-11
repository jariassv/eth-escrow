import { Contract, type ContractRunner } from "ethers";

type TokenMetadata = {
  symbol: string;
  decimals: number;
};

const ERC20_METADATA_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
] as const;

const metadataCache = new Map<string, TokenMetadata>();

export const getTokenMetadata = async (
  tokenAddress: string,
  runner: ContractRunner
): Promise<TokenMetadata> => {
  const key = tokenAddress.toLowerCase();
  const cached = metadataCache.get(key);
  if (cached) return cached;

  try {
    const contract = new Contract(tokenAddress, ERC20_METADATA_ABI, runner);
    const [symbol, decimals] = await Promise.all([
      contract.symbol(),
      contract.decimals(),
    ]);

    const metadata = {
      symbol: typeof symbol === "string" ? symbol : "TOKEN",
      decimals: Number(decimals) || 18,
    };

    metadataCache.set(key, metadata);
    return metadata;
  } catch (error) {
    console.warn("[token-metadata] fallback metadata for", tokenAddress, error);
    const fallback = { symbol: "TOKEN", decimals: 18 };
    metadataCache.set(key, fallback);
    return fallback;
  }
};

