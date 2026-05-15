"use client";

import { motion } from "framer-motion";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARC_EXPLORER_URL } from "@/lib/arc";
import { shortAddress } from "@/lib/utils";

export function BalanceCard({
  address,
  balance,
  symbol,
  loading,
  onRefresh,
  onFaucet
}: {
  address: string | null;
  balance: string;
  symbol: string;
  loading: boolean;
  onRefresh: () => void;
  onFaucet: () => void;
}) {
  const empty = !address || Number(balance) === 0;

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(47,140,255,0.22),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(139,92,246,0.18),transparent_32%)]" />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">Arc Testnet balance</p>
          <motion.h2
            className="mt-3 text-4xl font-black tracking-normal text-white sm:text-6xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loading ? "Syncing..." : `${Number(balance || 0).toLocaleString("en-US", { maximumFractionDigits: 6 })} ${symbol}`}
          </motion.h2>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Badge className={address ? "border-gain/25 bg-gain/10 text-gain" : "border-white/15 bg-white/10 text-white/70"}>
              <ShieldCheck size={14} aria-hidden="true" />
              {address ? "Non-custodial wallet" : "No wallet active"}
            </Badge>
            <span className="text-muted">{address ? shortAddress(address) : "Create or connect a wallet to begin."}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button variant="secondary" onClick={onRefresh} disabled={!address || loading}>
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            Retry Balance Sync
          </Button>
          {empty ? (
            <>
              <Button onClick={onFaucet} disabled={!address}>Claim Faucet</Button>
              <a className="text-sm font-bold text-arcblue hover:text-white" href={ARC_EXPLORER_URL} target="_blank" rel="noreferrer">
                View faucet guide
              </a>
            </>
          ) : null}
        </div>
      </div>
      {empty && address ? (
        <div className="mt-5 rounded-2xl border border-arcblue/25 bg-arcblue/10 p-4 text-sm font-semibold text-white/82">
          Claim Arc Testnet funds to begin. ARC ONE will refresh your balance after the faucet transaction confirms.
        </div>
      ) : null}
    </Card>
  );
}
