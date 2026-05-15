"use client";

import { createPublicClient, createWalletClient, formatUnits, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ARC_EXPLORER_URL, ARC_RPC_URL, arcTestnet } from "@/lib/arc";

export const publicArcClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC_URL)
});

export async function getNativeBalance(address: `0x${string}`) {
  const value = await publicArcClient.getBalance({ address });
  return {
    value,
    formatted: formatUnits(value, arcTestnet.nativeCurrency.decimals),
    symbol: arcTestnet.nativeCurrency.symbol
  };
}

export async function sendEmbeddedNativePayment({
  privateKey,
  to,
  amount
}: {
  privateKey: `0x${string}`;
  to: `0x${string}`;
  amount: string;
}) {
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(ARC_RPC_URL)
  });
  const hash = await walletClient.sendTransaction({
    to,
    value: parseUnits(amount, arcTestnet.nativeCurrency.decimals)
  });
  return { hash, explorerUrl: `${ARC_EXPLORER_URL}/tx/${hash}` };
}

export function isAddressLike(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
