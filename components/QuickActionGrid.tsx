"use client";

import { quickActions } from "@/lib/demo-data";

export function QuickActionGrid({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {quickActions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onAction(action.label)}
          className="focus-ring group rounded-2xl border border-line bg-white/[0.07] p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:bg-white/[0.11]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black transition group-hover:scale-105">
            <action.icon size={20} aria-hidden="true" />
          </span>
          <span className="mt-4 block text-sm font-black text-white">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
