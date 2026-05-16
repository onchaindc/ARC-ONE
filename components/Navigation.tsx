"use client";

import { navItems, NavId } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function SidebarNav({ active, onChange }: { active: NavId; onChange: (id: NavId) => void }) {
  return (
    <aside className="fixed left-0 top-0 hidden h-[100dvh] w-24 flex-col items-center border-r border-line bg-black/20 px-3 py-6 backdrop-blur-xl lg:flex">
      <button className="mb-9 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black font-black" onClick={() => onChange("home")}>
        A1
      </button>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "focus-ring flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold text-muted transition",
              active === item.id ? "bg-white text-black shadow-glow" : "hover:bg-white/10 hover:text-white"
            )}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <item.icon size={20} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function BottomNav({ active, onChange }: { active: NavId; onChange: (id: NavId) => void }) {
  return (
    <nav className="fixed inset-x-3 bottom-[calc(0.65rem+env(safe-area-inset-bottom))] z-40 grid max-w-[calc(100dvw-1.5rem)] grid-cols-5 gap-1 rounded-3xl border border-line bg-[#090d18]/92 p-1.5 shadow-soft backdrop-blur-xl sm:inset-x-4 sm:max-w-none sm:p-2 lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={cn(
            "focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 text-[10px] font-bold transition sm:px-1 sm:text-[11px]",
            active === item.id ? "bg-white text-black" : "text-muted hover:bg-white/10 hover:text-white"
          )}
          onClick={() => onChange(item.id)}
          type="button"
        >
          <item.icon size={19} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
