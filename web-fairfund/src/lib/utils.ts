import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "ethers";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const MAX_FRACTION_DIGITS = 2;

export const formatTokenAmount = (
  value: bigint,
  decimals: number,
  symbol: string
) => {
  const units = formatUnits(value, decimals);
  const numeric = Number.parseFloat(units);

  const formattedValue =
    Number.isFinite(numeric) && Math.abs(numeric) >= 1
      ? numeric.toLocaleString("es-ES", {
          maximumFractionDigits: MAX_FRACTION_DIGITS,
        })
      : Number.isFinite(numeric)
      ? numeric.toPrecision(2)
      : units;

  return {
    formatted: `${formattedValue} ${symbol}`,
    numeric: Number.isFinite(numeric) ? numeric : undefined,
    units,
  };
};

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return {
    date,
    formatted: date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  };
};
