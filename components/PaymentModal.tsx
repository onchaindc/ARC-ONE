"use client";

import { useState } from "react";
import { CheckCircle2, QrCode, Send, X } from "lucide-react";
import { mockArcSend } from "@/lib/arc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PaymentModal({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: string }) {
  const [recipient, setRecipient] = useState("@alex");
  const [amount, setAmount] = useState("50");
  const [status, setStatus] = useState("");

  if (!open) {
    return null;
  }

  async function preparePayment() {
    const result = await mockArcSend({ to: recipient, amount, token: "USDC" });
    setStatus(result.message);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center">
      <Card className="w-full max-w-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-arcblue">{mode}</p>
            <h2 className="mt-1 text-2xl font-black">Secure payment</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close payment modal">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-muted">
            Recipient username or wallet
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-base font-bold text-white outline-none" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-muted">
            Amount
            <div className="flex rounded-2xl border border-line bg-black/20">
              <input className="min-w-0 flex-1 bg-transparent px-4 py-3 text-2xl font-black text-white outline-none" value={amount} onChange={(event) => setAmount(event.target.value)} />
              <span className="flex items-center px-4 text-sm font-black text-white">USDC</span>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button className="focus-ring rounded-2xl border border-line bg-white/[0.06] p-4 text-left font-bold text-white hover:bg-white/10" type="button">
              <QrCode className="mb-3" size={22} aria-hidden="true" />
              QR code
            </button>
            <button className="focus-ring rounded-2xl border border-line bg-white/[0.06] p-4 text-left font-bold text-white hover:bg-white/10" type="button">
              <CheckCircle2 className="mb-3" size={22} aria-hidden="true" />
              Request link
            </button>
          </div>
        </div>
        {status ? (
          <div className="mt-4 rounded-2xl border border-gain/25 bg-gain/10 p-3 text-sm font-bold text-gain">{status}</div>
        ) : null}
        <Button className="mt-5 w-full" onClick={() => void preparePayment()}>
          <Send size={18} aria-hidden="true" />
          Prepare Confirmation
        </Button>
      </Card>
    </div>
  );
}
