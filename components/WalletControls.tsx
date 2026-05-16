"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Copy, Power, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { ARC_CHAIN_ID, arcTestnet } from "@/lib/arc";
import { useAppStore } from "@/lib/app-store";
import { shortAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function WalletControls({
  onCreateWallet,
  onLogout,
  networkBadge,
  networkSyncing,
  onAddArcNetwork,
  onSwitchArcNetwork
}: {
  onCreateWallet: () => void;
  onLogout: () => void;
  networkBadge: { label: string; tone: "good" | "danger" | "syncing" | "muted" };
  networkSyncing: boolean;
  onAddArcNetwork: () => void;
  onSwitchArcNetwork: () => void;
}) {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { walletMode, embeddedAddress } = useAppStore();
  const [open, setOpen] = useState(false);
  const [openConnectorPicker, setOpenConnectorPicker] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const activeAddress = walletMode === "embedded" ? embeddedAddress : address ?? null;
  const { data: balance } = useBalance({ address: activeAddress ?? undefined, chainId: ARC_CHAIN_ID, query: { enabled: Boolean(activeAddress) } });
  const formattedBalance = balance ? Number(formatUnits(balance.value, balance.decimals)).toFixed(4) : null;
  const showDisconnected = walletMode === "external" && !isConnected;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onPointerDown);
    }
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  if (!activeAddress) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onCreateWallet}>Create Wallet</Button>
        <Button onClick={() => setOpenConnectorPicker(true)} disabled={isPending || !connectors.length}>
          <Wallet size={18} aria-hidden="true" />
          Connect
        </Button>
        <ConnectWalletPicker
          open={openConnectorPicker}
          onClose={() => {
            setOpenConnectorPicker(false);
            setConnectError("");
          }}
          connectors={connectors}
          connectError={connectError}
          isPending={isPending}
          onConnect={async (connector) => {
            setConnectError("");
            try {
              await connectAsync({ connector, chainId: ARC_CHAIN_ID });
              setOpenConnectorPicker(false);
            } catch (error) {
              setConnectError(error instanceof Error ? error.message : "Wallet connection failed.");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2" ref={wrapRef}>
      {showDisconnected ? (
        <Badge className="hidden border-white/20 bg-white/10 text-white/80 sm:inline-flex">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-white/70" />
          Disconnected
        </Badge>
      ) : null}
      {networkBadge.tone === "danger" ? (
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="danger" size="sm" onClick={onSwitchArcNetwork}>Switch Network</Button>
          <Button variant="secondary" size="sm" onClick={onAddArcNetwork}>Add Arc Network</Button>
        </div>
      ) : (
        <Badge
          className={`hidden sm:inline-flex ${
            networkBadge.tone === "good"
              ? "border-gain/25 bg-gain/10 text-gain"
              : networkBadge.tone === "syncing"
                ? "border-arcblue/25 bg-arcblue/10 text-arcblue"
                : "border-white/20 bg-white/10 text-white/80"
          }`}
        >
          <span className={`mr-1.5 h-2 w-2 rounded-full ${networkBadge.tone === "good" ? "bg-gain" : networkBadge.tone === "syncing" ? "bg-arcblue animate-pulse" : "bg-white/70"}`} />
          {networkBadge.label}
        </Badge>
      )}
      <button
        className="focus-ring flex items-center gap-2 rounded-2xl border border-line bg-white/[0.08] px-3 py-2 text-left"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-white">{shortAddress(activeAddress)}</p>
          <p className="text-[11px] text-muted">{formattedBalance ? `${formattedBalance} ${balance?.symbol}` : arcTestnet.name}</p>
        </div>
        <ChevronDown size={16} className={`text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
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
        disabled={networkSyncing}
      >
        <Power size={18} aria-hidden="true" />
      </Button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-line bg-surface/95 p-4 shadow-soft backdrop-blur-xl"
          >
            <p className="text-xs font-bold uppercase text-muted">Wallet Address</p>
            <p className="mt-2 break-all text-sm font-semibold text-white">{activeAddress}</p>
            <Button
              className="mt-3 w-full"
              size="sm"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(activeAddress);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? <CheckCircle2 size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              {copied ? "Copied" : "Copy Address"}
            </Button>
            <div className="mt-3 grid gap-2 rounded-xl border border-line bg-black/20 p-3 text-xs">
              <p className="flex justify-between text-white/85"><span className="text-muted">Balance</span><span>{formattedBalance ?? "0.0000"} {balance?.symbol ?? arcTestnet.nativeCurrency.symbol}</span></p>
              <p className="flex justify-between text-white/85"><span className="text-muted">Network</span><span>{networkBadge.label}</span></p>
              <p className="flex justify-between text-white/85"><span className="text-muted">Wallet</span><span>{walletMode === "embedded" ? "Embedded" : "External"}</span></p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ConnectWalletPicker({
  open,
  onClose,
  connectors,
  isPending,
  connectError,
  onConnect
}: {
  open: boolean;
  onClose: () => void;
  connectors: ReturnType<typeof useConnect>["connectors"];
  isPending: boolean;
  connectError: string;
  onConnect: (connector: ReturnType<typeof useConnect>["connectors"][number]) => Promise<void>;
}) {
  const labelFor = (connector: ReturnType<typeof useConnect>["connectors"][number]) => {
    if (connector.type === "injected") {
      return "Browser Wallet";
    }
    if (connector.type === "walletConnect") {
      return "WalletConnect";
    }
    return connector.name;
  };

  if (!open) {
    return null;
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-md p-5" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Connect Wallet</h2>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close wallet picker">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted">Select a wallet provider to continue.</p>
        <div className="mt-4 grid gap-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="secondary"
              className="w-full justify-start"
              onClick={() => void onConnect(connector)}
              disabled={isPending}
            >
              <Wallet size={16} aria-hidden="true" />
              {labelFor(connector)}
            </Button>
          ))}
        </div>
        {connectError ? <p className="mt-3 rounded-xl border border-loss/25 bg-loss/10 p-3 text-sm font-bold text-loss">{connectError}</p> : null}
      </Card>
    </div>
  );
}
