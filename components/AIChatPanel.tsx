"use client";

import { useMemo, useState } from "react";
import { Bot, SendHorizonal, ShieldAlert, Sparkles } from "lucide-react";
import { Activity, Invoice } from "@/lib/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export function AIChatPanel({
  address,
  balance,
  username,
  activities,
  invoices,
  onPreparePayment,
  onPrepareInvoice
}: {
  address: string | null;
  balance: string;
  username: string;
  activities: Activity[];
  invoices: Invoice[];
  onPreparePayment: () => void;
  onPrepareInvoice: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "ARC AI online. Ask me to prepare payments, invoices, swap plans, or account summaries."
    }
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const suggestions = useMemo(
    () => ["Send 20 USDC to @alex", "Draft invoice for 75 USDC", "Summarize my wallet", "Review my latest activity"],
    []
  );

  async function submit(text = input) {
    const prompt = text.trim();
    if (!prompt || streaming) {
      return;
    }

    setInput("");
    setStreaming(true);
    const nextMessages = [...messages, { role: "user" as const, content: prompt }, { role: "assistant" as const, content: "" }];
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            address,
            balance,
            username,
            activityCount: activities.length,
            invoiceCount: invoices.length
          },
          messages: nextMessages.map((message) => ({ role: message.role, content: message.content }))
        })
      });

      if (!response.ok || !response.body) {
        const textBody = await response.text();
        throw new Error(textBody || "AI request failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const eventChunk of events) {
          if (eventChunk.startsWith("event:actions")) {
            const dataLine = eventChunk.split("\n").find((line) => line.startsWith("data:"));
            if (dataLine) {
              const payload = JSON.parse(dataLine.slice(5)) as string[];
              if (payload.includes("prepare_payment")) {
                onPreparePayment();
              }
              if (payload.includes("prepare_invoice")) {
                onPrepareInvoice();
              }
            }
            continue;
          }

          const lines = eventChunk.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) {
              continue;
            }
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") {
              continue;
            }
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((current) => {
                const updated = [...current];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  last.content += delta;
                }
                return updated;
              });
            }
          }
        }
      }
      reader.releaseLock();
    } catch (error) {
      setMessages((current) => {
        const updated = [...current];
        const last = updated[updated.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          last.content = error instanceof Error ? error.message : "AI response failed.";
        }
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <Card className="flex min-h-[35rem] flex-col p-4 sm:p-5">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
          <Bot size={21} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-black">ARC AI</h2>
          <p className="text-sm text-muted">Streaming assistant with context memory and tool signals</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((prompt) => (
          <button key={prompt} className="focus-ring rounded-full border border-line bg-white/[0.08] px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/[0.12]" type="button" onClick={() => void submit(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[86%] rounded-2xl bg-arcblue px-4 py-3 text-sm font-semibold text-white" : "max-w-[92%] rounded-2xl border border-line bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/82"}>
            {message.content || (streaming && index === messages.length - 1 ? "..." : "")}
          </div>
        ))}
        <div className="rounded-2xl border border-arcblue/30 bg-arcblue/10 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <ShieldAlert size={17} aria-hidden="true" />
            Confirmation required
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">AI prepares actions and proposals. Transaction execution still requires explicit wallet confirmation.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input className="min-w-0 flex-1 rounded-2xl border border-line bg-black/20 px-4 text-sm font-semibold text-white outline-none placeholder:text-muted" placeholder="Ask ARC AI..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} />
        <Button size="icon" onClick={() => void submit()} aria-label="Send message" disabled={streaming}>
          {streaming ? <Sparkles size={18} className="animate-pulse" aria-hidden="true" /> : <SendHorizonal size={18} aria-hidden="true" />}
        </Button>
      </div>
    </Card>
  );
}
