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
  const rate = tokenIn === "ETH" ? 3265 : tokenIn === "WBTC" ? 102240 : tokenIn === "EURC" ? 1.08 : 1;
  const outputRate = tokenOut === "ETH" ? 1 / 3265 : tokenOut === "WBTC" ? 1 / 102240 : tokenOut === "EURC" ? 0.92 : 1;
  const estimate = amount * rate * outputRate * 0.997;

  return {
    amountOut: estimate.toLocaleString("en-US", { maximumFractionDigits: tokenOut === "USDC" ? 2 : 6 }),
    fee: "$0.03",
    route: `${tokenIn} -> Arc liquidity -> ${tokenOut}`,
    poweredBy: "Circle App Kit on Arc Testnet"
  };
}

export async function mockArcSend({ to, amount, token }: ArcSendParams) {
  return {
    hash: `0xarc${crypto.randomUUID().replaceAll("-", "").slice(0, 28)}`,
    explorerUrl: `${ARC_EXPLORER_URL}/tx/0xarc-demo`,
    message: `Prepared ${amount} ${token} transfer to ${to} on Arc Testnet.`
  };
}
