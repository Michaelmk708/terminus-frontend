"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Card, CardHeader, ProgressBar } from "@/components/ui";

interface Props { 
  user: { 
    name: string; 
    email: string; 
    vault_pda?: string;
    owner_pubkey?: string;
  }; 
}

export default function OwnerDashboard({ user }: Props) {
  // PRODUCTION FIX: Use real user data from props
  const firstName = user.name.split(" ")[0] || "Owner";
  const [hbSigned, setHbSigned] = useState(false);
  const [vaultData, setVaultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PRODUCTION FIX: Fetch real vault data from backend on mount
  useEffect(() => {
    if (!user.owner_pubkey) {
      setLoading(false);
      console.warn("[OwnerDashboard] No owner_pubkey provided, using fallback data");
      return;
    }

    const fetchVaultData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/vault/${user.owner_pubkey}`,
          { 
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch vault: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[OwnerDashboard] ✓ Fetched real vault data:", data);
        setVaultData(data);
        setError(null);
      } catch (err: any) {
        console.error("[OwnerDashboard] Error fetching vault data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [user.owner_pubkey]);

  return (
    <div className="max-w-6xl mx-auto px-12 py-10 animate-fade-up">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-mono text-[12px] text-muted">Loading vault data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 p-4 rounded-lg bg-[rgba(196,92,92,0.1)] border border-[rgba(196,92,92,0.3)]">
          <p className="font-mono text-[12px] text-[#c45c5c]">⚠️ Error loading vault: {error}</p>
        </div>
      )}

      {/* Content (Only show when loaded) */}
      {!loading && (
        <>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-light text-cream mb-1">
            Welcome to your vault, <em className="italic text-gold-light">{firstName}</em>
          </h1>
          <p className="font-mono text-[12px] text-muted tracking-[0.06em]">
            Vault created successfully · {vaultData?.state_name || "Loading..."}
          </p>
        </div>
        <div className="font-mono text-[11px] text-muted bg-glass border border-line px-4 py-2 rounded-full tracking-[0.08em]">
          Vault #{user.vault_pda?.slice(0, 8).toUpperCase() || "......"} · {vaultData?.state_name || "..."}
        </div>
      </div>

      {/* Status banner */}
      <div className="relative bg-ink-2 border border-line rounded-xl p-8 mb-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-light opacity-60" />
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold mb-1">Vault Status</p>
            <p className="font-display text-2xl font-light text-cream">{vaultData?.state_name || "Loading..."}</p>
          </div>
          <Badge variant={vaultData?.state === 0 ? "success" : "warning"}>{vaultData?.state_name || "..."}</Badge>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-mono text-[12px] text-muted tracking-[0.06em]">Last heartbeat</span>
            <span className="font-mono text-[12px] text-gold">{vaultData?.last_heartbeat ? new Date(vaultData.last_heartbeat * 1000).toLocaleDateString() : "Never"}</span>
          </div>
          <ProgressBar value={vaultData?.state === 0 ? 100 : 50} />
        </div>
      </div>

      {/* Metrics (Real Data) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Vault PDA", value: vaultData?.vault_pda?.slice(0, 12) || "...", sub: "Smart contract account" },
          { label: "State",       value: vaultData?.state || "?",       sub: vaultData?.state_name || "..." },
          { label: "Challenge End Time",         value: vaultData?.challenge_end_time || "0",   sub: "Unix timestamp" },
          { label: "Execution Fee",     value: "1%",      sub: "Applied only on trigger" },
        ].map((m) => (
          <div key={m.label} className="bg-ink-2 border border-line rounded-xl p-6 hover:border-line2 transition-colors">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted mb-3">{m.label}</p>
            <p className="font-display text-3xl font-light text-cream mb-1">{m.value}</p>
            <p className="font-mono text-[11px] text-muted">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* Assets */}
          <Card>
            <CardHeader title="Vault Assets" action="+ Deposit Asset" />
            <div className="px-7 py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-line2 flex items-center justify-center text-xl mb-3 bg-glass">
                🏦
              </div>
              <p className="text-[14px] text-cream mb-1">Your vault is empty</p>
              <p className="text-[12px] text-muted max-w-xs mx-auto">
                Deposit SOL, SPL tokens, or encrypt legal documents to secure them in your digital legacy.
              </p>
              <Button variant="gold-outline" className="mt-5">Deposit Now</Button>
            </div>
          </Card>

          {/* Heartbeat CTA */}
          <div className="flex items-center gap-4 p-5 rounded-xl border"
            style={{ background: "var(--gold-glow)", borderColor: "rgba(201,169,110,0.15)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 animate-heartbeat"
              style={{ background: "var(--gold-dim)" }}>
              ♥
            </div>
            <div className="flex-1">
              <p className="text-[13px] text-cream font-medium mb-0.5">Confirm your heartbeat</p>
              <p className="text-[12px] text-muted">Your first check-in is due in 90 days. Sign a zero-gas proof of life.</p>
            </div>
            <Button variant="gold-outline" onClick={() => setHbSigned(true)} disabled={hbSigned}>
              {hbSigned ? "✓ Signed" : "Sign Heartbeat"}
            </Button>
          </div>

          {/* Panic Zone */}
          <div className="flex items-center justify-between gap-6 p-7 rounded-xl"
            style={{ background: "rgba(196,92,92,0.05)", border: "1px solid rgba(196,92,92,0.15)" }}>
            <div>
              <p className="text-[14px] text-cream font-medium mb-1">Emergency Override</p>
              <p className="text-[12px] text-muted leading-relaxed">
                If an inheritance claim has been triggered in error, use the Panic Button to instantly abort and slash the fraudulent stake.
              </p>
            </div>
            <Button variant="danger" className="flex-shrink-0">⚡ Panic Button</Button>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          {/* Beneficiary */}
          <Card>
            <CardHeader title="Beneficiary" action="Edit" />
            <div className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full bg-ink-4 border border-line2 flex items-center justify-center font-display text-base font-medium text-muted flex-shrink-0">
                  ?
                </div>
                <div>
                  <p className="text-[14px] text-cream mb-0.5">Setup Required</p>
                  <p className="font-mono text-[11px] text-muted">No beneficiary linked yet</p>
                </div>
              </div>
              <Button variant="gold-outline" full className="mt-2">Link Beneficiary</Button>
            </div>
          </Card>

          {/* Delegates */}
          <Card>
            <CardHeader title="Delegates" action="+ Invite" />
            <div className="px-7 py-8 text-center border-b border-line last:border-0">
               <p className="text-[13px] text-cream mb-1">Protect your vault</p>
               <p className="font-mono text-[11px] text-muted mb-4">Invite trusted delegates to form a multi-sig consensus for your legacy.</p>
               <Button variant="ghost" full>+ Add First Delegate</Button>
            </div>
          </Card>

          {/* Plan comparison */}
          <Card>
            <CardHeader title="Subscription" />
            <div className="p-5 space-y-3">
              <div className="rounded-xl border border-line bg-glass p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted mb-0.5">Free Plan</p>
                    <p className="font-display text-xl font-light text-cream">$0 <span className="font-mono text-[11px] text-muted font-normal">/ month</span></p>
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-line2 text-muted">Current</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
        </>
      )}
    </div>
  );
}