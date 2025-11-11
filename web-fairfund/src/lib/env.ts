const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const env = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  chainId: parseNumber(process.env.NEXT_PUBLIC_CHAIN_ID),
  fairFundAddress: process.env.NEXT_PUBLIC_FAIRFUND_ADDRESS ?? "",
};

export const isEnvConfigured =
  Boolean(env.rpcUrl) && Boolean(env.chainId) && Boolean(env.fairFundAddress);

export type SupportedEnv = typeof env;

