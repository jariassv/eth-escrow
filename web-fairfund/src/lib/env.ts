const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export type SupportedTokenConfig = {
  address: string;
  symbol: string;
  decimals?: number;
};

const parseSupportedTokens = (
  value: string | undefined
): SupportedTokenConfig[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as SupportedTokenConfig[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((token) => ({
        address: token.address ?? "",
        symbol: token.symbol ?? "",
        decimals: token.decimals,
      }))
      .filter((token) => token.address && token.symbol);
  } catch (error) {
    console.warn("[env] NEXT_PUBLIC_SUPPORTED_TOKENS inválido:", error);
    return [];
  }
};

export const env = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  chainId: parseNumber(process.env.NEXT_PUBLIC_CHAIN_ID),
  fairFundAddress: process.env.NEXT_PUBLIC_FAIRFUND_ADDRESS ?? "",
  supportedTokens: parseSupportedTokens(process.env.NEXT_PUBLIC_SUPPORTED_TOKENS),
};

export const isEnvConfigured =
  Boolean(env.rpcUrl) && Boolean(env.chainId) && Boolean(env.fairFundAddress);

export type SupportedEnv = typeof env;
