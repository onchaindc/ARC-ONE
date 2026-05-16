"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { arcTestnet } from "@/lib/arc";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const connectors = [
  injected({ shimDisconnect: true })
];

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "ARC ONE",
        description: "ARC ONE crypto finance super app",
        url: "https://arc.one",
        icons: ["https://arc.one/icon.png"]
      }
    })
  );
}

const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors,
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
