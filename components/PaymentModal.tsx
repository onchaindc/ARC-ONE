"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Send, X } from "lucide-react";
import { useSendTransaction } from "wagmi";
import { parseUnits } from "viem";
import { sendEmbeddedNativePayment, isAddressLike } from "@/lib/chain";
import { unlockEmbeddedWallet } from "@/lib/embedded-wallet";
import { useAppStore } from "@/lib/app-store";
import { arcTestnet, ARC_EXPLORER_URL } from "@/lib/arc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PaymentModal({
  open,
  onClose,
  mode,
  balance,
  onRefresh
}: {
  open: boolean;
  onClose: () => void;
  mode: string;
  balance: string;
  onRefresh: () => void;
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState<`0x${string}` | "">("");
  const [busy, setBusy] = useState(false);
  const { walletMode, addActivity } = useAppStore();
  const { sendTransactionAsync } = useSendTransaction();
  const insufficient = Number(amount || 0) > Number(balance || 0);
  const valid = isAddressLike(recipient) && Number(amount) > 0 && !insufficient;

  if (!open) {
    return null;
  }

  async function confirmPayment() {
    if (!valid) {
      setStatus("Enter a valid wallet address and amount within your available balance.");
      return;
    }

    setBusy(true);
    setStatus("Preparing wallet signature...");
    try {
      const to = recipient as `0x${string}`;
      const value = parseUnits(amount, arcTestnet.nativeCurrency.decimals);
      const result =
        walletMode === "embedded"
          ? await sendEmbeddedNativePayment({ privateKey: (await unlockEmbeddedWallet(passcode)).privateKey, to, amount })
          : { hash: await sendTransactionAsync({ to, value }), explorerUrl: "" };
      setHash(result.hash);
      setStatus("Transaction submitted. Waiting for Arc Testnet indexing.");
      addActivity({
        type: "payment",
        title: "Payment submitted",
        detail: `${amount} ${arcTestnet.nativeCurrency.symbol} to ${recipient}`,
        hash: result.hash,
        status: "pending"
      });
      onRefresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Payment failed before submission.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center">
      <Card className="w-full max-w-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-arcblue">{mode}</p>
            <h2 className="mt-1 text-2xl font-black">Send Payment</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close payment modal">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-muted">
            Recipient wallet address
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-base font-bold text-white outline-none" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x..." />
          </label>
          <label className="grid gap-2 text-sm font-bold text-muted">
            Amount
            <div className="flex rounded-2xl border border-line bg-black/20">
              <input className="min-w-0 flex-1 bg-transparent px-4 py-3 text-2xl font-black text-white outline-none" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
              <span className="flex items-center px-4 text-sm font-black text-white">{arcTestnet.nativeCurrency.symbol}</span>
            </div>
          </label>
          {walletMode === "embedded" ? (
            <label className="grid gap-2 text-sm font-bold text-muted">
              Wallet passcode
              <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} />
            </label>
          ) : null}
          <div className="rounded-2xl border border-line bg-white/[0.06] p-4 text-sm text-muted">
            Balance check: {Number(balance).toLocaleString("en-US", { maximumFractionDigits: 6 })} {arcTestnet.nativeCurrency.symbol}
            {insufficient ? <p className="mt-2 font-bold text-loss">Insufficient balance.</p> : null}
          </div>
        </div>
        {status ? <div className="mt-4 rounded-2xl border border-line bg-white/[0.06] p-3 text-sm font-bold text-white/82">{status}</div> : null}
        {hash ? (
          <a className="mt-3 flex items-center gap-2 text-sm font-bold text-arcblue" href={`${ARC_EXPLORER_URL}/tx/${hash}`} target="_blank" rel="noreferrer">
            <CheckCircle2 size={16} aria-hidden="true" />
            View transaction
          </a>
        ) : null}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(`arc-one://pay?to=${recipient}&amount=${amount}`)}>
            <Copy size={18} aria-hidden="true" />
            Copy Payment Link
          </Button>
          <Button onClick={() => void confirmPayment()} disabled={!valid || busy || (walletMode === "embedded" && passcode.length < 6)}>
            <Send size={18} aria-hidden="true" />
            {busy ? "Submitting..." : "Confirm & Sign"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
