"use client";

import { useMemo, useState } from "react";
import { Bot, SendHorizonal, ShieldAlert } from "lucide-react";
import { Activity, Invoice } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export function AIChatPanel({
  address,
  balance,
  activities,
  invoices,
  onPreparePayment,
  onPrepareInvoice
}: {
  address: string | null;
  balance: string;
  activities: Activity[];
  invoices: Invoice[];
  onPreparePayment: () => void;
  onPrepareInvoice: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "I can inspect your local ARC ONE context, prepare payments, draft invoices, and explain next steps. I will never execute transactions without your confirmation."
    }
  ]);
  const [input, setInput] = useState("");
  const suggestions = useMemo(
    () => ["Show my wallet status", "Prepare a payment", "Draft an invoice", "Explain my activity", "How do I get testnet funds?"],
    []
  );

  function answer(prompt: string) {
    const text = prompt.toLowerCase();
    if (!address) {
      return "No wallet is active. Create an in-app wallet or connect an external wallet first, then I can prepare actions.";
    }
    if (text.includes("payment") || text.includes("send")) {
      onPreparePayment();
      return "I opened the payment flow. Enter a recipient, amount, and confirm with your wallet. I will not submit anything automatically.";
    }
    if (text.includes("invoice") || text.includes("merchant")) {
      onPrepareInvoice();
      return "I opened the invoice tools. Fill in amount, token, settlement token, and expiry to create a real local invoice record.";
    }
    if (text.includes("activity") || text.includes("history")) {
      return activities.length
        ? `You have ${activities.length} recorded action${activities.length === 1 ? "" : "s"}. The newest status is ${activities[0]?.status}.`
        : "No activity yet. ARC ONE only records actual submitted payments, generated invoices, and user-triggered actions.";
    }
    if (text.includes("fund") || text.includes("faucet")) {
      return "Your balance is read from Arc Testnet RPC. If it is zero, use the Claim Faucet action, then retry balance sync after the faucet transaction confirms.";
    }
    return `Wallet ${address.slice(0, 6)}...${address.slice(-4)} is active with ${Number(balance || 0).toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC. You have ${invoices.length} invoice${invoices.length === 1 ? "" : "s"} and ${activities.length} activity item${activities.length === 1 ? "" : "s"}.`;
  }

  function submit(text = input) {
    const prompt = text.trim();
    if (!prompt) {
      return;
    }
    const response = answer(prompt);
    setMessages((current) => [...current, { role: "user", text: prompt }, { role: "assistant", text: response }]);
    setInput("");
  }

  return (
    <Card className="flex min-h-[35rem] flex-col p-4 sm:p-5">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
          <Bot size={21} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-black">ARC AI</h2>
          <p className="text-sm text-muted">Wallet-aware assistant with confirmation-first actions</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((prompt) => (
          <button key={prompt} className="focus-ring rounded-full border border-line bg-white/[0.08] px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/[0.12]" type="button" onClick={() => submit(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[86%] rounded-2xl bg-arcblue px-4 py-3 text-sm font-semibold text-white" : "max-w-[92%] rounded-2xl border border-line bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/82"}>
            {message.text}
          </div>
        ))}
        <div className="rounded-2xl border border-arcblue/30 bg-arcblue/10 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <ShieldAlert size={17} aria-hidden="true" />
            Confirmation required
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">AI prepares actions only. Wallet signatures and user confirmation are mandatory for payments and future swap execution.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input className="min-w-0 flex-1 rounded-2xl border border-line bg-black/20 px-4 text-sm font-semibold text-white outline-none placeholder:text-muted" placeholder="Ask ARC AI..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} />
        <Button size="icon" onClick={() => submit()} aria-label="Send message">
          <SendHorizonal size={18} aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
