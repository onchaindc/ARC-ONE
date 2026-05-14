"use client";

import { useState } from "react";
import { Bot, SendHorizonal, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const prompts = [
  "Send 50 USDC to @alex",
  "Swap ETH to USDC",
  "Show my spending this month",
  "Best low-risk yield?",
  "Explain my portfolio"
];

export function AIChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Your portfolio is stablecoin-heavy with ETH upside. I can prepare actions, but I will always ask for confirmation before any transaction."
    }
  ]);
  const [input, setInput] = useState("");

  function submit(text = input) {
    if (!text.trim()) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text },
      {
        role: "assistant",
        text: "I prepared a recommended action card. Review token, amount, route, and recipient before confirming. ARC ONE will never auto-spend funds."
      }
    ]);
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
          <p className="text-sm text-muted">Finance copilot with confirmation-first actions</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
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
          <p className="mt-2 text-sm leading-6 text-muted">AI can recommend swaps, sends, invoices, and spending insights. Wallet signature and user confirmation are mandatory for every transaction.</p>
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
