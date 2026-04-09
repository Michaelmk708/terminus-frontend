"use client";

import { useState, useRef } from "react";
import { Button, FormInput } from "@/components/ui";
import clsx from "clsx";

type Step = 0 | 1 | 2 | 3 | "success";

const verifySteps = [
  { label: "Document received",       sub: "SHA-256 fingerprint stored on Solana", state: "done"    },
  { label: "OCR analysis complete",   sub: "Confidence score: 96% · Layout valid",  state: "done"    },
  { label: "Awaiting delegate approval", sub: "2 of 3 delegates must confirm",      state: "loading" },
  { label: "ZK proof generation",     sub: "Pending delegate threshold",             state: "pending" },
];

export default function BeneficiaryPortal() {
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState<string[]>(Array(6).fill(""));
  const [claiming, setClaiming] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  function nextStep() {
    setStep((s) => {
      if (s === 0) return 1;
      if (s === 1) return 2;
      if (s === 2) return 3;
      return s;
    });
  }

  function handlePinChange(index: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[index] = val;
    setPin(next);
    if (val && index < 5) pinRefs.current[index + 1]?.focus();
  }

  function handleClaim() {
    setClaiming(true);
    setTimeout(() => setStep("success"), 1800);
  }

  const dots: { state: "active" | "done" | "idle" }[] = [0, 1, 2, 3].map((i) => ({
    state:
      step === "success" ? "done"
      : typeof step === "number" && i < step ? "done"
      : typeof step === "number" && i === step ? "active"
      : "idle",
  }));

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[500px] bg-ink-2 border border-line rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">

        {/* Portal header */}
        <div className="relative text-center px-11 pt-10 pb-8 bg-ink-3 border-b border-line overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.25)" }}>
            ⚖️
          </div>
          <h2 className="font-display text-3xl font-light text-cream mb-1.5">
            {step === "success" ? "Inheritance Released" : "Inheritance Claim"}
          </h2>
          <p className="text-[13px] text-muted">Terminus · Secure Beneficiary Portal</p>

          {/* Step dots */}
          {step !== "success" && (
            <div className="flex justify-center gap-2 mt-6">
              {dots.map((d, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-300",
                    d.state === "active" ? "w-5 bg-gold" :
                    d.state === "done"   ? "w-1.5 bg-[#5c9c7a]" :
                                           "w-1.5 bg-line2"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-11 py-9">

          {/* Step 0 – Email */}
          {step === 0 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold mb-2">Step 1 of 4</p>
              <h3 className="font-display text-2xl font-normal text-cream mb-2">Identify yourself</h3>
              <p className="text-[13px] text-muted mb-7 leading-relaxed">
                Enter the email the vault owner registered for you. No crypto wallet needed.
              </p>
              <div className="mb-6">
                <FormInput label="Email Address" type="email" placeholder="your@email.com" value={email} onChange={setEmail} />
              </div>
              <Button variant="primary" full onClick={nextStep} disabled={!email.includes("@")}>
                Continue →
              </Button>
            </div>
          )}

          {/* Step 1 – Upload */}
          {step === 1 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold mb-2">Step 2 of 4</p>
              <h3 className="font-display text-2xl font-normal text-cream mb-2">Upload documentation</h3>
              <p className="text-[13px] text-muted mb-6 leading-relaxed">
                Upload an official death or medical certificate. Our AI verifies it — no personal data is stored.
              </p>

              {/* Stake warning */}
              <div className="flex gap-3 p-4 rounded-lg mb-5"
                style={{ background: "rgba(201,132,58,0.08)", border: "1px solid rgba(201,132,58,0.2)" }}>
                <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-[12px] text-muted leading-relaxed">
                  A refundable stake of{" "}
                  <strong className="text-[#c9843a]">$50 USDC</strong> is required to prevent fraud. Returned on successful verification. Forged documents result in forfeiture.
                </p>
              </div>

              {/* Upload zone */}
              <label className="relative flex flex-col items-center justify-center w-full p-8 rounded-lg cursor-pointer transition-all duration-200 mb-6 text-center group"
                style={{ background: "var(--glass)", border: "1px dashed var(--line2)" }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                />
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
                {fileName ? (
                  <p className="text-[13px] text-gold-light font-medium">{fileName}</p>
                ) : (
                  <>
                    <p className="text-[13px] text-muted">Drop certificate here or click to browse</p>
                    <p className="font-mono text-[11px] text-muted-2 mt-1">PDF · JPG · PNG · Max 10MB</p>
                  </>
                )}
              </label>

              <Button variant="primary" full onClick={nextStep}>
                Submit for Verification →
              </Button>
            </div>
          )}

          {/* Step 2 – AI verification */}
          {step === 2 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold mb-2">Step 3 of 4</p>
              <h3 className="font-display text-2xl font-normal text-cream mb-2">AI verification</h3>
              <p className="text-[13px] text-muted mb-6 leading-relaxed">
                The Terminus AI Lawyer is verifying your document and notifying delegates.
              </p>

              <div className="bg-ink border border-line rounded-lg p-5 mb-6">
                {verifySteps.map((v, i) => (
                  <div key={v.label} className={clsx("flex items-center gap-3 py-3", i < verifySteps.length - 1 && "border-b border-line")}>
                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0",
                      v.state === "done"    ? "bg-[rgba(92,156,122,0.15)] text-[#5c9c7a]" :
                      v.state === "loading" ? "bg-[rgba(201,132,58,0.1)] text-[#c9843a] animate-spin" :
                                              "bg-glass2 text-muted"
                    )}>
                      {v.state === "done" ? "✓" : v.state === "loading" ? "↻" : "◦"}
                    </div>
                    <div>
                      <p className="text-[12px] text-cream">{v.label}</p>
                      <p className="font-mono text-[11px] text-muted">{v.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="primary" full onClick={nextStep}>
                Check Status →
              </Button>
            </div>
          )}

          {/* Step 3 – PIN */}
          {step === 3 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold mb-2">Step 4 of 4</p>
              <h3 className="font-display text-2xl font-normal text-cream mb-2">Enter your secret PIN</h3>
              <p className="text-[13px] text-muted mb-7 leading-relaxed">
                The 30-day challenge period has elapsed. Enter the PIN the vault owner shared with you.
              </p>

              <div className="flex gap-2.5 mb-8">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !digit && i > 0) pinRefs.current[i - 1]?.focus(); }}
                    className="flex-1 aspect-square text-center bg-ink border border-line2 rounded-lg text-cream font-mono text-2xl outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/5 transition-all"
                  />
                ))}
              </div>

              <Button
                variant="primary"
                full
                onClick={handleClaim}
                disabled={claiming || pin.some((d) => !d)}
              >
                {claiming ? "Verifying on-chain…" : "Release Inheritance"}
              </Button>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 animate-pop-in"
                style={{ background: "rgba(92,156,122,0.1)", border: "2px solid #5c9c7a" }}>
                ✓
              </div>
              <p className="text-[13px] text-muted mb-8 leading-relaxed">
                Your assets have been transferred and your private documents have been decrypted.
              </p>

              <div className="text-left p-4 rounded-lg mb-3"
                style={{ background: "rgba(92,156,122,0.05)", border: "1px solid rgba(92,156,122,0.2)" }}>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#5c9c7a] mb-2">Transferred to your wallet</p>
                <p className="font-mono text-[13px] text-cream mb-1">142.5 SOL · 26,825 USDC</p>
                <p className="font-mono text-[11px] text-muted">≈ $48,200 · Tx confirmed on Solana</p>
              </div>

              <div className="text-left p-4 rounded-lg"
                style={{ background: "var(--gold-glow)", border: "1px solid rgba(201,169,110,0.15)" }}>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-gold mb-2">Decrypted documents</p>
                <p className="text-[13px] text-cream">📄 Will &amp; Testament.pdf</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
