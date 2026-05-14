"use client";

import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Copy,
  CreditCard,
  KeyRound,
  LifeBuoy,
  Link,
  LockKeyhole,
  Moon,
  QrCode,
  ReceiptText,
  Search,
  Settings2,
  Share2,
  Sparkles,
  UsersRound,
  Wallet,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { AIChatPanel } from "@/components/AIChatPanel";
import { AssetTable } from "@/components/AssetTable";
import { BalanceCard } from "@/components/BalanceCard";
import { BottomNav, SidebarNav } from "@/components/Navigation";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { PaymentModal } from "@/components/PaymentModal";
import { QuickActionGrid } from "@/components/QuickActionGrid";
import { SwapWidget } from "@/components/SwapWidget";
import { WalletControls } from "@/components/WalletControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { activities, banners, markets, NavId, roadmap, trustItems } from "@/lib/demo-data";

export function ArcOneApp() {
  const [active, setActive] = useState<NavId>("home");
  const [modal, setModal] = useState("");
  const [preview, setPreview] = useState(false);
  const { isConnected } = useAccount();

  if (!isConnected && !preview) {
    return <Onboarding onPreview={() => setPreview(true)} />;
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-24">
      <SidebarNav active={active} onChange={setActive} />
      <BottomNav active={active} onChange={setActive} />
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Header />
        <motion.div key={active} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {active === "home" ? <HomePage onAction={setModal} /> : null}
          {active === "pay" ? <PaymentsPage onAction={setModal} /> : null}
          {active === "trade" ? <TradePage /> : null}
          {active === "ai" ? <AIPage /> : null}
          {active === "profile" ? <ProfilePage /> : null}
        </motion.div>
      </main>
      <PaymentModal open={Boolean(modal)} mode={modal} onClose={() => setModal("")} />
    </div>
  );
}

function Onboarding({ onPreview }: { onPreview: () => void }) {
  const { connectors, connect, isPending } = useConnect();
  const connector = connectors[0];

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col">
        <Header />
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <Badge className="border-arcblue/30 bg-arcblue/10 text-arcblue">Powered by Arc Testnet</Badge>
            <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-normal text-white sm:text-7xl">Your All-in-One Crypto Finance App</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              Hold, swap, send, request, and pay merchants with a clean non-custodial finance experience built for mass adoption.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => connector && connect({ connector })} disabled={isPending || !connector}>
                <Wallet size={18} aria-hidden="true" />
                Connect Wallet
              </Button>
              <Button variant="secondary" onClick={onPreview}>
                <Sparkles size={18} aria-hidden="true" />
                Preview App
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {trustItems.map((item) => (
                <Badge key={item.label}>
                  <item.icon size={14} aria-hidden="true" />
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-arcblue/20 via-arcpurple/20 to-transparent blur-3xl" />
            <Card className="relative overflow-hidden p-4">
              <BalanceCard />
              <div className="mt-4">
                <QuickActionGrid onAction={() => undefined} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {markets.map((market) => (
                  <MarketCard key={market.symbol} {...market} />
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">A1</div>
        <div>
          <p className="text-xl font-black text-white">ARC ONE</p>
          <p className="text-xs font-bold text-muted">Arc Testnet finance OS</p>
        </div>
      </div>
      <WalletControls />
    </header>
  );
}

function HomePage({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <section className="space-y-5">
        <BalanceCard />
        <QuickActionGrid onAction={onAction} />
        <AssetTable />
        <ActivityFeed />
      </section>
      <aside className="space-y-5">
        <MarketSnapshot />
        <BannerCarousel />
        <TrustPanel />
      </aside>
    </div>
  );
}

function PaymentsPage({ onAction }: { onAction: (action: string) => void }) {
  const sendOptions: Array<[string, LucideIcon]> = [
    ["Username", Search],
    ["Wallet address", Wallet],
    ["QR code", QrCode]
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
      <section className="space-y-5">
        <Card className="p-5">
          <h1 className="text-2xl font-black">Payments Hub</h1>
          <p className="mt-2 text-muted">Send by username, wallet address, QR code, invoice, or merchant checkout.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {sendOptions.map(([label, Icon]) => (
              <button key={String(label)} className="focus-ring rounded-2xl border border-line bg-white/[0.06] p-4 text-left font-black text-white hover:bg-white/10" type="button" onClick={() => onAction(`Send by ${label}`)}>
                <Icon className="mb-4" size={22} aria-hidden="true" />
                {String(label)}
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Merchant Checkout</h2>
            <Badge>Beta</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-muted">Invoice amount<input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" defaultValue="89.00" /></label>
            <label className="grid gap-2 text-sm font-bold text-muted">Settlement token<select className="rounded-2xl border border-line bg-surface px-4 py-3 text-white outline-none" defaultValue="USDC"><option>USDC</option><option>EURC</option></select></label>
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white/[0.06] p-4 text-sm text-muted">
            User pays ETH. Merchant receives USDC. Quote and route are prepared through Arc liquidity tooling.
          </div>
          <Button className="mt-5" onClick={() => onAction("Merchant Checkout")}>
            <CreditCard size={18} aria-hidden="true" />
            Generate Checkout
          </Button>
        </Card>
      </section>
      <aside className="space-y-5">
        <MerchantDashboard />
        <ComingSoonCard title="Split Bill" body="Create shared payment requests with live settlement status." />
        <ComingSoonCard title="Subscriptions" body="Recurring crypto payments for memberships, payroll, and SaaS." />
      </aside>
    </div>
  );
}

function TradePage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
      <SwapWidget />
      <section className="space-y-5">
        <MarketSnapshot />
        <Card className="p-5">
          <h2 className="text-xl font-black">Watchlist</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {markets.map((market) => <MarketCard key={market.symbol} {...market} />)}
          </div>
        </Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <ComingSoonCard title="Limit Orders" body="Set precise entries with protected execution." />
          <ComingSoonCard title="DCA Orders" body="Automate recurring buys with clean risk controls." />
          <ComingSoonCard title="Price Alerts" body="Push alerts and AI watch summaries." />
        </div>
        <RoadmapWall />
      </section>
    </div>
  );
}

function AIPage() {
  return <AIChatPanel />;
}

function ProfilePage() {
  const rows: Array<[string, string, LucideIcon]> = [
    ["Username management", "@onchaindc", KeyRound],
    ["Security settings", "Passkeys, approvals, spending limits", LockKeyhole],
    ["Connected wallets", "Primary EVM wallet", Wallet],
    ["Notification settings", "Push, email, merchant alerts", Bell],
    ["Theme switcher", "Dark mode default", Moon],
    ["Referral rewards", "Launch rewards soon", Share2],
    ["Support center", "Priority crypto finance help", LifeBuoy]
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-arcblue to-arcpurple text-lg font-black">DC</div>
          <div>
            <h1 className="text-2xl font-black">@onchaindc</h1>
            <p className="text-muted">0x7adf...b8a2</p>
          </div>
        </div>
        <div className="mt-6 divide-y divide-line">
          {rows.map(([title, detail, Icon]) => (
            <button key={String(title)} className="flex w-full items-center justify-between gap-4 py-4 text-left" type="button">
              <span className="flex items-center gap-3">
                <Icon size={20} className="text-arcblue" aria-hidden="true" />
                <span>
                  <span className="block font-black text-white">{String(title)}</span>
                  <span className="text-sm text-muted">{String(detail)}</span>
                </span>
              </span>
              <Settings2 size={18} className="text-muted" aria-hidden="true" />
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-black">Username Registry</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Search, claim, and resolve handles to wallet addresses through the placeholder backend registry.</p>
        <div className="mt-5 rounded-2xl border border-line bg-black/20 p-4">
          <p className="text-xs font-bold uppercase text-muted">Claimed handle</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-black">@onchaindc</span>
            <CheckCircle2 size={20} className="text-gain" aria-hidden="true" />
          </div>
        </div>
        <Button className="mt-5 w-full" variant="secondary">
          <Copy size={18} aria-hidden="true" />
          Copy Profile Link
        </Button>
      </Card>
    </div>
  );
}

function ActivityFeed() {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-lg font-black">Activity</h2>
      {activities.map((activity) => (
        <div key={activity.title} className="flex items-center justify-between gap-3 rounded-2xl p-3 hover:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black">
              <activity.icon size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="font-black">{activity.title}</p>
              <p className="text-sm text-muted">{activity.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black">{activity.amount}</p>
            <p className="text-xs font-bold text-muted">{activity.status}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}

function MarketSnapshot() {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">Market Snapshot</h2>
        <Zap size={18} className="text-arcblue" aria-hidden="true" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {markets.map((market) => <MarketCard key={market.symbol} {...market} />)}
      </div>
    </Card>
  );
}

function MarketCard({ symbol, price, change }: { symbol: string; price: string; change: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.06] p-4">
      <div className="flex items-center justify-between">
        <span className="font-black">{symbol}</span>
        <span className={change >= 0 ? "text-sm font-bold text-gain" : "text-sm font-bold text-loss"}>{change >= 0 ? "+" : ""}{change}%</span>
      </div>
      <p className="mt-3 text-2xl font-black">{price}</p>
    </div>
  );
}

function BannerCarousel() {
  return (
    <div className="grid gap-3">
      {banners.map((banner) => (
        <ComingSoonCard key={banner.title} title={banner.title} body={banner.body} badge={banner.badge} />
      ))}
    </div>
  );
}

function TrustPanel() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-black">Trust Layer</h2>
      <div className="mt-4 space-y-3">
        {trustItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-sm font-bold text-white/82">
            <item.icon size={18} className="text-gain" aria-hidden="true" />
            {item.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

function MerchantDashboard() {
  const tools: Array<[string, LucideIcon]> = [
    ["Payment links", Link],
    ["Create invoices", ReceiptText],
    ["QR checkout", QrCode],
    ["Payment history", CreditCard],
    ["Settlement status", CheckCircle2]
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Merchant Tools</h2>
        <Badge>Beta</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {tools.map(([label, Icon]) => (
          <button key={String(label)} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.06] p-3 text-sm font-black text-white hover:bg-white/10" type="button">
            <Icon size={18} className="text-arcblue" aria-hidden="true" />
            {String(label)}
          </button>
        ))}
      </div>
    </Card>
  );
}

function RoadmapWall() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roadmap.map((item) => (
        <ComingSoonCard key={item} title={item} body="Roadmap feature prepared in the ARC ONE product surface." />
      ))}
    </div>
  );
}
