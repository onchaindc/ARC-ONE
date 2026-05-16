"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, LogIn, Wallet, X } from "lucide-react";
import { useConnect } from "wagmi";
import { createEmbeddedWallet, getEmbeddedWalletRecord, unlockEmbeddedWallet } from "@/lib/embedded-wallet";
import { saveLocalAuthSession } from "@/lib/session";
import { useAppStore } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ARC_CHAIN_ID } from "@/lib/arc";

export function WalletOnboarding({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"create" | "login">("create");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [error, setError] = useState("");
  const [openConnectorPicker, setOpenConnectorPicker] = useState(false);
  const [connectError, setConnectError] = useState("");
  const { connectors, connectAsync, isPending } = useConnect();
  const { setWalletMode, setEmbeddedAddress, upsertWallet } = useAppStore();
  const storedWallet = getEmbeddedWalletRecord();

  const labelFor = (connector: (typeof connectors)[number]) => {
    if (connector.type === "injected") {
      return "Browser Wallet";
    }
    if (connector.type === "walletConnect") {
      return "WalletConnect";
    }
    return connector.name;
  };

  async function createWallet() {
    setError("");
    try {
      const wallet = await createEmbeddedWallet(passcode, email);
      setWalletMode("embedded");
      setEmbeddedAddress(wallet.address);
      upsertWallet({ address: wallet.address, label: "In-app wallet", mode: "embedded", primary: true });
      saveLocalAuthSession({ mode: "embedded", address: wallet.address, unlockedAt: new Date().toISOString() });
      setRecoveryPhrase(wallet.recoveryPhrase);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create wallet.");
    }
  }

  async function loginWallet() {
    setError("");
    try {
      if (!storedWallet) {
        throw new Error("No embedded wallet found on this device.");
      }
      if (storedWallet.email !== email.trim().toLowerCase()) {
        throw new Error("Email does not match this device wallet.");
      }
      const unlocked = await unlockEmbeddedWallet(passcode);
      setWalletMode("embedded");
      setEmbeddedAddress(unlocked.account.address);
      upsertWallet({ address: unlocked.account.address, label: "In-app wallet", mode: "embedded", primary: true });
      saveLocalAuthSession({ mode: "embedded", address: unlocked.account.address, unlockedAt: new Date().toISOString() });
      onDone();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    }
  }

  async function connectWallet(connector: (typeof connectors)[number]) {
    setError("");
    setConnectError("");
    try {
      await connectAsync({ connector, chainId: ARC_CHAIN_ID });
      setWalletMode("external");
      onDone();
    } catch (connectFailure) {
      setConnectError(connectFailure instanceof Error ? connectFailure.message : "Unable to connect wallet.");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
          <Wallet size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-black">Create or restore wallet</h2>
          <p className="text-sm text-muted">Use email + passcode for persistent local wallet access.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant={mode === "create" ? "primary" : "secondary"} onClick={() => setMode("create")}>Create</Button>
        <Button variant={mode === "login" ? "primary" : "secondary"} onClick={() => setMode("login")} disabled={!storedWallet}>Log In</Button>
      </div>
      {recoveryPhrase ? (
        <div className="mt-5 rounded-2xl border border-gain/25 bg-gain/10 p-4">
          <div className="flex items-center gap-2 font-black text-white">
            <CheckCircle2 size={18} className="text-gain" aria-hidden="true" />
            Wallet created
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">Store this recovery phrase safely. It is shown once.</p>
          <div className="mt-3 rounded-2xl border border-line bg-black/30 p-4 font-mono text-sm text-white">{recoveryPhrase}</div>
          <Button className="mt-4 w-full" onClick={onDone}>Enter ARC ONE</Button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-muted">
            Email
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-muted">
            Passcode
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="Minimum 6 characters" />
          </label>
          {error ? <p className="rounded-2xl border border-loss/25 bg-loss/10 p-3 text-sm font-bold text-loss">{error}</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {mode === "create" ? (
              <Button onClick={() => void createWallet()} disabled={passcode.length < 6 || !email}>
                <KeyRound size={18} aria-hidden="true" />
                Create In-App Wallet
              </Button>
            ) : (
              <Button onClick={() => void loginWallet()} disabled={passcode.length < 6 || !email || !storedWallet}>
                <LogIn size={18} aria-hidden="true" />
                Log In
              </Button>
            )}
            <Button variant="secondary" onClick={() => setOpenConnectorPicker(true)} disabled={isPending || !connectors.length}>
              <Wallet size={18} aria-hidden="true" />
              Connect Existing
            </Button>
          </div>
        </div>
      )}
      {openConnectorPicker ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 backdrop-blur-sm sm:place-items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpenConnectorPicker(false);
              setConnectError("");
            }
          }}
        >
          <Card className="w-full max-w-md p-5" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Connect Wallet</h2>
              <Button size="icon" variant="ghost" onClick={() => setOpenConnectorPicker(false)} aria-label="Close wallet picker">
                <X size={18} aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted">Choose a wallet provider.</p>
            <div className="mt-4 grid gap-2">
              {connectors.map((connector) => (
                <Button key={connector.uid} variant="secondary" className="w-full justify-start" onClick={() => void connectWallet(connector)} disabled={isPending}>
                  <Wallet size={16} aria-hidden="true" />
                  {labelFor(connector)}
                </Button>
              ))}
            </div>
            {connectError ? <p className="mt-3 rounded-xl border border-loss/25 bg-loss/10 p-3 text-sm font-bold text-loss">{connectError}</p> : null}
          </Card>
        </div>
      ) : null}
    </Card>
  );
}
