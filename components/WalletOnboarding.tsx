"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, Wallet } from "lucide-react";
import { useConnect } from "wagmi";
import { createEmbeddedWallet } from "@/lib/embedded-wallet";
import { useAppStore } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WalletOnboarding({ onDone }: { onDone: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [error, setError] = useState("");
  const { connectors, connect, isPending } = useConnect();
  const { setWalletMode, setEmbeddedAddress, upsertWallet } = useAppStore();
  const connector = connectors[0];

  async function createWallet() {
    setError("");
    try {
      const wallet = await createEmbeddedWallet(passcode);
      setWalletMode("embedded");
      setEmbeddedAddress(wallet.address);
      upsertWallet({ address: wallet.address, label: "In-app wallet", mode: "embedded", primary: true });
      setRecoveryPhrase(wallet.recoveryPhrase);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create wallet.");
    }
  }

  function connectWallet() {
    if (!connector) {
      setError("No injected wallet was found in this browser.");
      return;
    }
    setWalletMode("external");
    connect({ connector });
    onDone();
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
          <Wallet size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-black">Create account in 10 seconds</h2>
          <p className="text-sm text-muted">Create an encrypted in-app wallet or connect an existing wallet.</p>
        </div>
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
            Wallet passcode
            <input className="rounded-2xl border border-line bg-black/20 px-4 py-3 text-white outline-none" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="Minimum 6 characters" />
          </label>
          {error ? <p className="rounded-2xl border border-loss/25 bg-loss/10 p-3 text-sm font-bold text-loss">{error}</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => void createWallet()} disabled={passcode.length < 6}>
              <KeyRound size={18} aria-hidden="true" />
              Create In-App Wallet
            </Button>
            <Button variant="secondary" onClick={connectWallet} disabled={isPending}>
              <Wallet size={18} aria-hidden="true" />
              Connect Existing
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
