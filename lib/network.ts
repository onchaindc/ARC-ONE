"use client";

import { ARC_CHAIN_ID, ARC_EXPLORER_URL, ARC_RPC_URL, arcTestnet } from "@/lib/arc";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getEthereumProvider() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.ethereum ?? null;
}

export async function addArcNetwork() {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error("No EVM wallet provider was found.");
  }
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
        chainName: arcTestnet.name,
        rpcUrls: [ARC_RPC_URL],
        nativeCurrency: arcTestnet.nativeCurrency,
        blockExplorerUrls: [ARC_EXPLORER_URL]
      }
    ]
  });
}

export async function switchToArcNetwork() {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error("No EVM wallet provider was found.");
  }
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${ARC_CHAIN_ID.toString(16)}` }]
  });
}
