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
  Settings2,
  Share2,
  Wallet,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { AssetTable } from "@/components/AssetTable";
import { BalanceCard } from "@/components/BalanceCard";
import { BottomNav, SidebarNav } from "@/components/Navigation";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { PaymentModal } from "@/components/PaymentModal";
import { QuickActionGrid } from "@/components/QuickActionGrid";
import { SwapWidget } from "@/components/SwapWidget";
import { WalletControls } from "@/components/WalletControls";
import { WalletOnboarding } from "@/components/WalletOnboarding";
import { ArcLogo, WalletAvatar } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NavId, roadmap, trustItems } from "@/lib/demo-data";
import { useAppStore } from "@/lib/app-store";
import { getNativeBalance } from "@/lib/chain";
import { applyTheme } from "@/lib/theme";
import { arcTestnet } from "@/lib/arc";
import { exportEmbeddedWallet, getEmbeddedWalletRecord } from "@/lib/embedded-wallet";
import { clearLocalAuthSession, readLocalAuthSession, saveLocalAuthSession } from "@/lib/session";
import { useNetworkStatus } from "@/lib/use-network-status";

type Panel = "username" | "security" | "wallets" | "notifications" | "theme" | "referrals" | "support" | "invoice" | "coming-soon" | null;

export function ArcOneApp() {
  const [active, setActive] = useState<NavId>("home");
  const [modal, setModal] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [balance, setBalance] = useState("0");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [status, setStatus] = useState("");
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [restoringSession, setRestoringSession] = useState(true);
  const [dismissWrongNetwork, setDismissWrongNetwork] = useState(false);
  const { address: externalAddress, isConnected } = useAccount();
  const network = useNetworkStatus();
  const {
    walletMode,
    embeddedAddress,
    activeAddress,
    setActiveAddress,
    setWalletMode,
    logout,
    upsertWallet,
    activities,
    invoices,
    addActivity,
    preferences,
    profile
  } = useAppStore();
  const address = (walletMode === "embedded" ? embeddedAddress : externalAddress ?? activeAddress) ?? null;
  const networkBadge =
    walletMode === "embedded"
      ? { label: arcTestnet.name, tone: "good" as const }
      : network.badge;

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    const session = readLocalAuthSession();
    const embedded = getEmbeddedWalletRecord();
    if (session?.mode === "embedded" && embedded && embedded.address.toLowerCase() === session.address.toLowerCase()) {
      setWalletMode("embedded");
      setActiveAddress(embedded.address);
    }
    setRestoringSession(false);
  }, [setActiveAddress, setWalletMode]);

  useEffect(() => {
    if (isConnected && externalAddress) {
      setWalletMode("external");
      setActiveAddress(externalAddress);
      upsertWallet({ address: externalAddress, label: "External wallet", mode: "external", primary: true });
      saveLocalAuthSession({ mode: "external", address: externalAddress, unlockedAt: new Date().toISOString() });
    }
  }, [externalAddress, isConnected, setActiveAddress, setWalletMode, upsertWallet]);

  useEffect(() => {
    void refreshBalance();
  }, [address]);

  useEffect(() => {
    if (!network.wrongNetwork) {
      setDismissWrongNetwork(false);
    }
  }, [network.wrongNetwork]);

  async function refreshBalance() {
    if (!address) {
      setBalance("0");
      return;
    }
    setLoadingBalance(true);
    try {
      const nextBalance = await getNativeBalance(address);
      setBalance(nextBalance.formatted);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to sync Arc Testnet balance.");
    } finally {
      setLoadingBalance(false);
    }
  }

  function claimFaucet() {
    if (!address) {
      setStatus("Create or connect a wallet before claiming faucet funds.");
      return;
    }
    setFaucetLoading(true);
    const created = addActivity({
      type: "faucet",
      title: "Faucet requested",
      detail: `Open faucet for ${address}`,
      status: "pending"
    });
    setStatus("Opening Circle faucet in a new tab.");
    window.open("https://faucet.circle.com", "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setFaucetLoading(false);
      useAppStore.getState().updateActivity(created.id, {
        status: "confirmed",
        title: "Faucet opened",
        detail: "Faucet link opened. Refresh balance after funding."
      });
    }, 1200);
  }

  function handleLogout() {
    clearLocalAuthSession();
    logout();
    setStatus("Session closed. Log in to restore your wallet.");
  }

  if (restoringSession) {
    return (
      <main className="min-h-screen grid place-items-center">
        <Card className="p-6 text-center">
          <p className="font-black text-white">Restoring session...</p>
        </Card>
      </main>
    );
  }

  if (!address) {
    return <Onboarding onDone={() => void refreshBalance()} onAddArcNetwork={() => void network.addNetwork()} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden pb-32 lg:pb-0 lg:pl-24">
      <SidebarNav active={active} onChange={setActive} />
      <BottomNav active={active} onChange={setActive} />
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          onCreateWallet={() => setPanel("wallets")}
          onLogout={handleLogout}
          networkBadge={networkBadge}
          networkSyncing={network.syncing}
          onAddArcNetwork={() => void network.addNetwork()}
          onSwitchArcNetwork={() => void network.switchNetwork()}
        />
        {status ? <div className="mb-5 rounded-2xl border border-line bg-white/[0.06] p-3 text-sm font-bold text-white/82">{status}</div> : null}
        <motion.div key={active} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {active === "home" ? <HomePage address={address} balance={balance} loading={loadingBalance} faucetLoading={faucetLoading} onAction={(action) => {
            if (action === "Swap") {
              setActive("trade");
              setStatus("Opened swap interface.");
              return;
            }
            if (action === "Receive") {
              setModal("Receive");
              return;
            }
            if (action === "Pay Merchant") {
              setModal("Pay Merchant");
              return;
            }
            setModal("Send");
          }} onRefresh={() => void refreshBalance()} onFaucet={claimFaucet} /> : null}
          {active === "pay" ? <PaymentsPage onAction={(action) => {
            if (action === "QR Payment" || action === "Payment Link") {
              setModal("Receive");
              return;
            }
            if (action === "Merchant Checkout") {
              setModal("Pay Merchant");
              return;
            }
            setModal("Send");
          }} onPanel={setPanel} /> : null}
          {active === "trade" ? <TradePage balance={balance} /> : null}
          {active === "ai" ? (
            <ComingSoonCard
              title="ARC AI"
              badge="Coming Soon"
              body="AI assistant is temporarily paused while we complete reliability and safety upgrades. It will return with stronger payment and portfolio workflows."
            />
          ) : null}
          {active === "profile" ? <ProfilePage address={address} onPanel={setPanel} /> : null}
        </motion.div>
      </main>
      <PaymentModal
        open={Boolean(modal)}
        mode={modal}
        balance={balance}
        address={address}
        networkLabel={networkBadge.label}
        onArc={walletMode === "embedded" ? true : network.onArc}
        onRequireSwitch={() => void network.switchNetwork()}
        onRefresh={() => void refreshBalance()}
        onClose={() => setModal("")}
      />
      <SettingsPanel panel={panel} onClose={() => setPanel(null)} onAddArcNetwork={() => void network.addNetwork()} />
      <WrongNetworkModal open={walletMode === "external" && network.wrongNetwork && !dismissWrongNetwork} onSwitch={() => void network.switchNetwork()} onAddNetwork={() => void network.addNetwork()} onClose={() => setDismissWrongNetwork(true)} />
    </div>
  );
}

function Onboarding({ onDone, onAddArcNetwork }: { onDone: () => void; onAddArcNetwork: () => void }) {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <ArcLogo />
          <Badge className="mt-8 border-arcblue/30 bg-arcblue/10 text-arcblue">Powered by Arc Testnet</Badge>
          <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-normal text-white sm:text-7xl">Your crypto finance operating system.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Start empty, create a secure wallet, claim testnet funds, then send, invoice, and manage real Arc Testnet activity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {trustItems.map((item) => (
              <Badge key={item.label}>
                <item.icon size={14} aria-hidden="true" />
                {item.label}
              </Badge>
            ))}
          </div>
        </div>
        <WalletOnboarding onDone={onDone} />
        <Card className="p-5">
          <h3 className="text-xl font-black">ARC ONE runs on Arc Testnet.</h3>
          <p className="mt-2 text-sm text-muted">Install Arc network in your wallet before your first external-wallet transaction.</p>
          <Button className="mt-4 w-full" variant="secondary" onClick={onAddArcNetwork}>Add Arc Network</Button>
        </Card>
      </div>
    </main>
  );
}

function Header({
  onCreateWallet,
  onLogout,
  networkBadge,
  networkSyncing,
  onAddArcNetwork,
  onSwitchArcNetwork
}: {
  onCreateWallet: () => void;
  onLogout: () => void;
  networkBadge: { label: string; tone: "good" | "danger" | "syncing" | "muted" };
  networkSyncing: boolean;
  onAddArcNetwork: () => void;
  onSwitchArcNetwork: () => void;
}) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <ArcLogo className="min-w-0" />
      <WalletControls
        onCreateWallet={onCreateWallet}
        onLogout={onLogout}
        networkBadge={networkBadge}
        networkSyncing={networkSyncing}
        onAddArcNetwork={onAddArcNetwork}
        onSwitchArcNetwork={onSwitchArcNetwork}
      />
    </header>
  );
}

function HomePage({
  address,
  balance,
  loading,
  faucetLoading,
  onAction,
  onRefresh,
  onFaucet
}: {
  address: string | null;
  balance: string;
  loading: boolean;
  faucetLoading: boolean;
  onAction: (action: string) => void;
  onRefresh: () => void;
  onFaucet: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <section className="space-y-5">
        <BalanceCard address={address} balance={balance} symbol={arcTestnet.nativeCurrency.symbol} loading={loading} faucetLoading={faucetLoading} onRefresh={onRefresh} onFaucet={onFaucet} />
        <QuickActionGrid onAction={onAction} />
        <AssetTable balance={balance} symbol={arcTestnet.nativeCurrency.symbol} />
        <ActivityFeed />
      </section>
      <aside className="space-y-5">
        <NetworkPanel onRefresh={onRefresh} />
        <RoadmapWall />
        <TrustPanel />
      </aside>
    </div>
  );
}

function PaymentsPage({ onAction, onPanel }: { onAction: (action: string) => void; onPanel: (panel: Panel) => void }) {
  const sendOptions: Array<[string, LucideIcon, string]> = [
    ["Wallet address", Wallet, "Send by Wallet"],
    ["Receive link", Link, "Payment Link"],
    ["QR code", QrCode, "QR Payment"]
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
      <section className="space-y-5">
        <Card className="p-5">
          <h1 className="text-2xl font-black">Payments Hub</h1>
          <p className="mt-2 text-muted">Validate, preview, sign, and record payments. No fake success states.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {sendOptions.map(([label, Icon, action]) => (
              <button key={label} className="focus-ring rounded-2xl border border-line bg-white/[0.06] p-4 text-left font-black text-white hover:bg-white/10" type="button" onClick={() => onAction(action)}>
                <Icon className="mb-4" size={22} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <Button className="mt-5" onClick={() => onAction("Merchant Checkout")}>
            <CreditCard size={16} aria-hidden="true" />
            Pay Merchant
          </Button>
        </Card>
        <InvoiceBuilder />
      </section>
      <aside className="space-y-5">
        <MerchantDashboard onPanel={onPanel} />
        <ComingSoonCard title="Split Bill" body="Preview group payment requests and settlement rules before this feature ships." />
        <ComingSoonCard title="Subscriptions" body="Recurring crypto approvals will require explicit user spending limits." />
      </aside>
    </div>
  );
}

function TradePage({ balance }: { balance: string }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
      <SwapWidget balance={balance} symbol={arcTestnet.nativeCurrency.symbol} />
      <section className="space-y-5">
        <Card className="p-5">
          <h2 className="text-xl font-black">Markets</h2>
          <div className="mt-4 rounded-2xl border border-dashed border-line bg-black/20 p-6 text-center">
            <p className="font-black text-white">No market feed configured.</p>
            <p className="mt-2 text-sm leading-6 text-muted">Connect a real price indexer before showing movers, charts, or analytics.</p>
          </div>
        </Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <ComingSoonCard title="Limit Orders" body="Will open a routed order ticket once router contracts are configured." />
          <ComingSoonCard title="DCA Orders" body="Will schedule recurring signed swaps with explicit user approval." />
          <ComingSoonCard title="Price Alerts" body="Will persist notification rules and trigger alerts from a live market feed." />
        </div>
      </section>
    </div>
  );
}

function ProfilePage({ address, onPanel }: { address: string; onPanel: (panel: Panel) => void }) {
  const { profile } = useAppStore();
  const rows: Array<[Panel, string, string, LucideIcon]> = [
    ["username", "Username management", profile.username || "Claim a username", KeyRound],
    ["security", "Security settings", "Passcode, export, approvals", LockKeyhole],
    ["wallets", "Connected wallets", "Manage embedded and external wallets", Wallet],
    ["notifications", "Notification settings", "Persist alert preferences", Bell],
    ["theme", "Theme switcher", "Dark, light, or system", Moon],
    ["referrals", "Referral rewards", "Coming soon", Share2],
    ["support", "Support center", "Help, FAQ, report issue", LifeBuoy]
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card className="p-5">
      <div className="flex items-center gap-4">
          <WalletAvatar label={profile.username || "AO"} />
          <div>
            <h1 className="text-2xl font-black">{profile.username || "Unnamed account"}</h1>
            <p className="text-muted">{address}</p>
          </div>
        </div>
        <div className="mt-6 divide-y divide-line">
          {rows.map(([panel, title, detail, Icon]) => (
            <button key={title} className="flex w-full items-center justify-between gap-4 py-4 text-left" type="button" onClick={() => onPanel(panel)}>
              <span className="flex items-center gap-3">
                <Icon size={20} className="text-arcblue" aria-hidden="true" />
                <span>
                  <span className="block font-black text-white">{title}</span>
                  <span className="text-sm text-muted">{detail}</span>
                </span>
              </span>
              <Settings2 size={18} className="text-muted" aria-hidden="true" />
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-black">Account Status</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Your profile is stored locally and ready for backend persistence through the username API.</p>
        <Button className="mt-5 w-full" variant="secondary" onClick={() => void navigator.clipboard.writeText(address)}>
          <Copy size={18} aria-hidden="true" />
          Copy Wallet Address
        </Button>
      </Card>
    </div>
  );
}

function ActivityFeed() {
  const { activities } = useAppStore();
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-lg font-black">Activity</h2>
      {activities.length ? (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between gap-3 rounded-2xl p-3 hover:bg-white/[0.06]">
            <div>
              <p className="font-black">{activity.title}</p>
              <p className="text-sm text-muted">{activity.detail}</p>
            </div>
            <Badge className={activity.status === "failed" ? "text-loss" : activity.status === "confirmed" ? "text-gain" : ""}>{activity.status}</Badge>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-black/20 p-6 text-center">
          <p className="font-black text-white">No transactions yet.</p>
          <p className="mt-2 text-sm leading-6 text-muted">Payments, faucet requests, invoices, and future swaps will appear here after real user actions.</p>
        </div>
      )}
    </Card>
  );
}

function NetworkPanel({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">Arc Testnet</h2>
        <Zap size={18} className="text-arcblue" aria-hidden="true" />
      </div>
      <div className="space-y-3 text-sm text-muted">
        <p>Network: {arcTestnet.name}</p>
        <p>Chain ID: {arcTestnet.id}</p>
      </div>
      <Button className="mt-4 w-full" variant="secondary" onClick={onRefresh}>Sync Wallet</Button>
    </Card>
  );
}

function InvoiceBuilder() {
  const { addInvoice } = useAppStore();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<string>(arcTestnet.nativeCurrency.symbol);
  const [settlementToken, setSettlementToken] = useState<string>(arcTestnet.nativeCurrency.symbol);
  const [expiry, setExpiry] = useState("24h");
  const [link, setLink] = useState("");

  function createInvoice() {
    if (!Number(amount)) {
      return;
    }
    const invoice = addInvoice({ amount, token, settlementToken, expiry });
    setLink(invoice.paymentLink);
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Create Invoice</h2>
        <Badge>Live Local Record</Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-muted">Amount<input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
        <label className="grid gap-2 text-sm font-bold text-muted">Token<input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={token} onChange={(event) => setToken(event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-bold text-muted">Settlement token<input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={settlementToken} onChange={(event) => setSettlementToken(event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-bold text-muted">Expiry<input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></label>
      </div>
      <Button className="mt-5" onClick={createInvoice} disabled={!Number(amount)}>
        <ReceiptText size={18} aria-hidden="true" />
        Generate Invoice
      </Button>
      {link ? <div className="mt-4 rounded-2xl border border-line bg-white/[0.06] p-3 text-sm font-bold text-white/82">{link}</div> : null}
    </Card>
  );
}

function MerchantDashboard({ onPanel }: { onPanel: (panel: Panel) => void }) {
  const { invoices } = useAppStore();
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Merchant Tools</h2>
        <Badge>Active</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        <button className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.06] p-3 text-sm font-black text-white hover:bg-white/10" type="button" onClick={() => onPanel("invoice")}>
          <ReceiptText size={18} className="text-arcblue" aria-hidden="true" />
          Create invoices
        </button>
        {invoices.length ? invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-2xl border border-line bg-black/20 p-3 text-sm">
            <p className="font-black text-white">{invoice.amount} {invoice.token}</p>
            <p className="text-muted">{invoice.status} | {invoice.expiry}</p>
          </div>
        )) : <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">No merchant settlements found.</p>}
      </div>
    </Card>
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

function RoadmapWall() {
  return (
    <div className="grid gap-3">
      {roadmap.slice(0, 4).map((item) => (
        <ComingSoonCard key={item} title={item} body="Opens as a preview surface until backend contracts and data feeds are configured." />
      ))}
    </div>
  );
}

function SettingsPanel({ panel, onClose, onAddArcNetwork }: { panel: Panel; onClose: () => void; onAddArcNetwork: () => void }) {
  const { profile, updateProfile, preferences, updatePreferences, wallets, setPrimaryWallet, removeWallet, walletMode } = useAppStore();
  const [username, setUsername] = useState(profile.username);
  const [supportMessage, setSupportMessage] = useState("");
  const [exportPasscode, setExportPasscode] = useState("");
  const [exportData, setExportData] = useState<{ privateKey: string; recoveryPhrase: string } | null>(null);
  const [exportError, setExportError] = useState("");

  if (!panel) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto p-5" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black capitalize">{String(panel).replace("-", " ")}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>x</Button>
        </div>
        {panel === "username" ? (
          <div className="mt-5 grid gap-3">
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="username" />
            <Button onClick={() => updateProfile({ username })} disabled={username.length < 3}>Claim Username</Button>
          </div>
        ) : null}
        {panel === "security" ? (
          <div className="mt-5 grid gap-3">
            <Toggle label="Biometric unlock" checked={preferences.security.biometrics} onChange={(biometrics) => updatePreferences({ security: { ...preferences.security, biometrics } })} />
            <Toggle label="Require transaction approvals" checked={preferences.security.requireApproval} onChange={(requireApproval) => updatePreferences({ security: { ...preferences.security, requireApproval } })} />
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" value={preferences.security.approvalLimit} onChange={(event) => updatePreferences({ security: { ...preferences.security, approvalLimit: event.target.value } })} />
            {walletMode === "embedded" ? (
              <>
                <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" type="password" value={exportPasscode} onChange={(event) => setExportPasscode(event.target.value)} placeholder="Passcode to export wallet" />
                <Button
                  onClick={async () => {
                    setExportError("");
                    try {
                      const exported = await exportEmbeddedWallet(exportPasscode);
                      setExportData(exported);
                    } catch (error) {
                      setExportError(error instanceof Error ? error.message : "Unable to export wallet.");
                    }
                  }}
                  disabled={exportPasscode.length < 6}
                >
                  Export Private Key
                </Button>
                {exportError ? <p className="text-sm font-bold text-loss">{exportError}</p> : null}
                {exportData ? (
                  <div className="rounded-2xl border border-line bg-black/20 p-3 text-xs text-white/90">
                    <p className="font-bold break-all">Private key: {exportData.privateKey}</p>
                    <p className="mt-2">Recovery phrase: {exportData.recoveryPhrase}</p>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
        {panel === "wallets" ? (
          <div className="mt-5 grid gap-3">
            <Button variant="secondary" onClick={onAddArcNetwork}>Add Arc Network</Button>
            {wallets.length ? wallets.map((wallet) => (
              <div key={wallet.address} className="rounded-2xl border border-line bg-black/20 p-3">
                <p className="font-black text-white">{wallet.label}</p>
                <p className="break-all text-sm text-muted">{wallet.address}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setPrimaryWallet(wallet.address)}>Set Primary</Button>
                  <Button size="sm" variant="danger" onClick={() => removeWallet(wallet.address)}>Remove</Button>
                </div>
              </div>
            )) : <p className="text-muted">No connected wallets.</p>}
          </div>
        ) : null}
        {panel === "notifications" ? (
          <div className="mt-5 grid gap-3">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <Toggle key={key} label={key} checked={value} onChange={(checked) => updatePreferences({ notifications: { ...preferences.notifications, [key]: checked } })} />
            ))}
          </div>
        ) : null}
        {panel === "theme" ? (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["dark", "light", "system"] as const).map((theme) => (
              <Button key={theme} variant={preferences.theme === theme ? "primary" : "secondary"} onClick={() => updatePreferences({ theme })}>{theme}</Button>
            ))}
          </div>
        ) : null}
        {panel === "referrals" || panel === "coming-soon" ? <ComingSoonCard title="Coming Soon" body="This feature has a dedicated preview surface and will activate when its backend is ready." /> : null}
        {panel === "support" ? (
          <div className="mt-5 grid gap-3">
            <p className="text-sm text-muted">FAQ: Wallet creation, faucet claims, payments, invoices, and safety approvals.</p>
            <textarea className="min-h-28 rounded-2xl border border-line bg-black/20 p-4 text-white outline-none" value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Report an issue..." />
            <Button disabled={!supportMessage}>Submit Support Request</Button>
          </div>
        ) : null}
        {panel === "invoice" ? <InvoiceBuilder /> : null}
      </Card>
    </div>
  );
}

function WrongNetworkModal({
  open,
  onSwitch,
  onAddNetwork,
  onClose
}: {
  open: boolean;
  onSwitch: () => void;
  onAddNetwork: () => void;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-md p-5" onMouseDown={(event) => event.stopPropagation()}>
        <h2 className="text-xl font-black">You are connected to Ethereum.</h2>
        <p className="mt-2 text-sm text-muted">Switch to Arc Testnet to continue.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button onClick={onSwitch}>Switch Network</Button>
          <Button variant="secondary" onClick={onAddNetwork}>Add Arc Network</Button>
        </div>
      </Card>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-line bg-white/[0.06] p-3 text-sm font-bold text-white">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
