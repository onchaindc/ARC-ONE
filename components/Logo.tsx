import { cn } from "@/lib/utils";

export function ArcLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ArcMark className="h-10 w-10" />
      {!compact ? (
        <div className="leading-none">
          <p className="text-lg font-black tracking-normal text-white">ARC ONE</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Finance OS</p>
        </div>
      ) : null}
    </div>
  );
}

export function ArcMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label="ARC ONE">
      <defs>
        <linearGradient id="arc-one-mark" x1="8" x2="42" y1="40" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2f8cff" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="15" fill="#080b14" />
      <path
        d="M13 34.5 22.4 13h4.9L37 34.5h-5.4l-2-4.9h-9.5l-1.9 4.9H13Zm8.9-9.4h5.9L24.8 18l-2.9 7.1Z"
        fill="url(#arc-one-mark)"
      />
      <path d="M12.5 37.5h23" stroke="url(#arc-one-mark)" strokeLinecap="round" strokeWidth="2.6" />
    </svg>
  );
}

export function WalletAvatar({ label }: { label?: string }) {
  const initials = label?.trim().slice(0, 2).toUpperCase() || "A1";

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-arcblue to-arcpurple text-xs font-black text-white shadow-glow">
      {initials}
    </div>
  );
}
