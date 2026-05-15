"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Lock, RefreshCw, Route } from "lucide-react";
import { getArcSwapQuote } from "@/lib/arc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tokens = ["USDC", "ETH", "WBTC", "EURC"];

export function SwapWidget({ balance, symbol }: { balance: string; symbol: string }) {
  const [from, setFrom] = useState<string>(symbol || "USDC");
  const [to, setTo] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [quote, setQuote] = useState<{ amountOut: string; fee: string; route: string; poweredBy: string; executable: boolean; reason: string } | null>(null);
  const insufficient = Number(amount || 0) > Number(balance || 0);

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
        <Badge>Router Required</Badge>
      </div>
      <SwapInput label="From" token={from} setToken={setFrom} amount={amount} setAmount={setAmount} />
      <div className="flex justify-center py-2">
        <button className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/10" type="button" onClick={() => { setFrom(to); setTo(from); }}>
          <ArrowDown size={18} aria-hidden="true" />
        </button>
      </div>
      <SwapInput label="To" token={to} setToken={setTo} amount={quote?.amountOut || ""} setAmount={() => undefined} readOnly />
      <label className="mt-4 grid gap-2 text-sm font-bold text-muted">
        Slippage
        <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={slippage} onChange={(event) => setSlippage(event.target.value)} />
      </label>
      <div className="mt-4 rounded-2xl border border-line bg-white/[0.05] p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Balance check</span>
          <span className={insufficient ? "font-bold text-loss" : "font-bold text-white"}>{insufficient ? "Insufficient" : `${balance} ${symbol}`}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-muted">
          <Route size={15} aria-hidden="true" />
          {quote?.route ?? "Enter an amount to preview route"}
        </div>
        {quote?.reason ? <p className="mt-3 leading-6 text-muted">{quote.reason}</p> : null}
      </div>
      <Button className="mt-4 w-full" disabled>
        {quote?.executable ? <RefreshCw size={18} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
        Swap Execution Disabled
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
  readOnly
}: {
  label: string;
  token: string;
  setToken: (token: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-black/20 p-4">
      <label className="text-xs font-bold uppercase text-muted">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none placeholder:text-white/30"
          value={amount}
          placeholder="0.00"
          onChange={(event) => setAmount(event.target.value)}
          readOnly={readOnly}
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
