"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money, shortAddress } from "@/lib/utils";

export function BalanceCard() {
  const { address } = useAccount();
  const total = 20104;

  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(47,140,255,0.22),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(139,92,246,0.18),transparent_32%)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">Total portfolio</p>
          <motion.h2
            className="mt-3 text-4xl font-black tracking-normal text-white sm:text-6xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {money(total)}
          </motion.h2>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <Badge className="border-gain/25 bg-gain/10 text-gain">
              <ArrowUpRight size={14} aria-hidden="true" />
              +3.42% today
            </Badge>
            <span className="text-muted">@onchaindc</span>
            <span className="text-muted">{shortAddress(address ?? "0x7adf4d8f71d1834b36df518a15d99661f267b8a2")}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white/10 p-3 text-arcblue">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
