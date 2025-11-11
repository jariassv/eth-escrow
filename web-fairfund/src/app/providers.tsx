"use client";

import { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";

type ProvidersProps = {
  children: ReactNode;
};

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });

const WalletInitializer = () => {
  useWallet();
  return null;
};

export function Providers({ children }: ProvidersProps) {
  const [client] = useState(createClient);
  return (
    <QueryClientProvider client={client}>
      <WalletInitializer />
      {children}
    </QueryClientProvider>
  );
}

