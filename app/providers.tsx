"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet } from "@/lib/arc";

const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected({ target: "metaMask" }), injected()],
  transports: {
    [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0])
  },
  ssr: true
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
