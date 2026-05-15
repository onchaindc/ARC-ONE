"use client";

import { AlertTriangle, Bell, ChevronDown, Power, Wallet } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ARC_CHAIN_ID, arcTestnet } from "@/lib/arc";
import { useAppStore } from "@/lib/app-store";
import { shortAddress } from "@/lib/utils";
import { WalletAvatar } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function WalletControls({ onCreateWallet, onLogout }: { onCreateWallet: () => void; onLogout: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const connector = connectors[0];
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { walletMode, embeddedAddress } = useAppStore();
  const activeAddress = walletMode === "embedded" ? embeddedAddress : address ?? null;
  const { data: balance } = useBalance({ address: activeAddress ?? undefined, chainId: ARC_CHAIN_ID, query: { enabled: Boolean(activeAddress) } });
  const wrongNetwork = walletMode === "external" && isConnected && chainId !== ARC_CHAIN_ID;
  const formattedBalance = balance ? Number(formatUnits(balance.value, balance.decimals)).toFixed(4) : null;

  if (!activeAddress) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onCreateWallet}>Create Wallet</Button>
        <Button
          onClick={() => {
            if (connector) {
              connect({ connector });
            }
          }}
          disabled={isPending || !connector}
        >
          <Wallet size={18} aria-hidden="true" />
          Connect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button className="focus-ring hidden h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white/[0.08] text-white sm:flex" type="button">
        <Bell size={18} aria-hidden="true" />
      </button>
      {wrongNetwork ? (
        <Button variant="danger" onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}>
          <AlertTriangle size={17} aria-hidden="true" />
          Switch to Arc
        </Button>
      ) : (
        <Badge className="hidden border-gain/25 bg-gain/10 text-gain sm:inline-flex">Arc Testnet</Badge>
      )}
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-white/[0.08] px-3 py-2">
        <WalletAvatar />
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-white">{shortAddress(activeAddress)}</p>
          <p className="text-[11px] text-muted">{formattedBalance ? `${formattedBalance} ${balance?.symbol}` : arcTestnet.name}</p>
        </div>
        <ChevronDown size={16} className="text-muted" aria-hidden="true" />
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          if (walletMode === "external") {
            disconnect();
          }
          onLogout();
        }}
        aria-label="Disconnect wallet"
      >
        <Power size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}
