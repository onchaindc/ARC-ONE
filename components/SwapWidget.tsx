"use client";

import { useEffect, useState } from "react";
import { ArrowDown, RefreshCw, Route } from "lucide-react";
import { getArcSwapQuote } from "@/lib/arc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tokens = ["USDC", "ETH", "WBTC", "EURC"];

export function SwapWidget() {
  const [from, setFrom] = useState("ETH");
  const [to, setTo] = useState("USDC");
  const [amount, setAmount] = useState("0.08");
  const [quote, setQuote] = useState<{ amountOut: string; fee: string; route: string; poweredBy: string } | null>(null);

  useEffect(() => {
    let alive = true;
    void getArcSwapQuote({ tokenIn: from, tokenOut: to, amountIn: amount }).then((nextQuote) => {
      if (alive) {
        setQuote(nextQuote);
      }
    });

    return () => {
      alive = false;
    };
  }, [amount, from, to]);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">Swap</h2>
        <Badge>Arc Testnet</Badge>
      </div>
      <SwapInput label="From" token={from} setToken={setFrom} amount={amount} setAmount={setAmount} />
      <div className="flex justify-center py-2">
        <button className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/10" type="button" onClick={() => { setFrom(to); setTo(from); }}>
          <ArrowDown size={18} aria-hidden="true" />
        </button>
      </div>
      <SwapInput label="To" token={to} setToken={setTo} amount="" setAmount={() => undefined} readOnlyAmount="Auto quote" />
      <Quote quote={quote} />
      <Button className="mt-4 w-full">
        <RefreshCw size={18} aria-hidden="true" />
        Swap Now
      </Button>
    </Card>
  );
}

function SwapInput({
  label,
  token,
  setToken,
  amount,
  setAmount,
  readOnlyAmount
}: {
  label: string;
  token: string;
  setToken: (token: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  readOnlyAmount?: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-black/20 p-4">
      <label className="text-xs font-bold uppercase text-muted">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none placeholder:text-white/30"
          value={readOnlyAmount ?? amount}
          onChange={(event) => setAmount(event.target.value)}
          readOnly={Boolean(readOnlyAmount)}
        />
        <select className="rounded-2xl border border-line bg-surface px-3 py-2 text-sm font-bold text-white" value={token} onChange={(event) => setToken(event.target.value)}>
          {tokens.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Quote({ quote }: { quote: { amountOut: string; fee: string; route: string; poweredBy: string } | null }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-white/[0.05] p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted">Live quote</span>
        <span className="font-bold text-white">{quote?.amountOut ?? "..."}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-muted">Estimated fee</span>
        <span className="font-bold text-white">{quote?.fee ?? "$0.03"}</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-muted">
        <Route size={15} aria-hidden="true" />
        {quote?.route ?? "Arc liquidity route"}
      </div>
    </div>
  );
}
