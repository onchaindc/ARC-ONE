import { defineChain } from "viem";

export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL = "https://rpc.testnet.arc.network";
export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";

export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USDC",
    symbol: "USDC"
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
      webSocket: ["wss://rpc.testnet.arc.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: ARC_EXPLORER_URL
    }
  },
  testnet: true
});

export type ArcSendParams = {
  to: string;
  amount: string;
  token: "USDC" | "EURC" | "ETH" | "WBTC";
};

export type ArcSwapParams = {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
};

export async function createArcAppKit() {
  return {
    chain: arcTestnet,
    rpcUrl: ARC_RPC_URL,
    mode: "mock-arc-sdk",
    features: ["wallets", "payments", "swaps", "merchant-invoices"]
  };
}

export async function getArcSwapQuote({ tokenIn, tokenOut, amountIn }: ArcSwapParams) {
  const amount = Number(amountIn || 0);

  return {
    amountOut: amount > 0 && tokenIn === tokenOut ? amount.toString() : "",
    fee: "Unavailable",
    route: `${tokenIn} -> Arc liquidity -> ${tokenOut}`,
    executable: false,
    reason:
      "ARC ONE is connected to Arc Testnet RPC, but no production swap router contract is configured yet. Execution is disabled until a verified router address is added.",
    poweredBy: "Arc Testnet RPC"
  };
}
