"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Key, Mail } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function LookupForm() {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!uniqueId.trim() || !email.trim()) {
      setError("Enter both your Unique ID and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueId: uniqueId.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "We couldn't find that certificate record.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        uid: uniqueId.trim(),
        email: email.trim(),
      });
      router.push(`/certificate?${params.toString()}`);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="uniqueId" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-950/80 mb-1.5">
          <Key className="w-3.5 h-3.5 text-amber-600" />
          Unique ID
        </label>
        <input
          id="uniqueId"
          type="text"
          autoComplete="off"
          value={uniqueId}
          onChange={(e) => setUniqueId(e.target.value)}
          placeholder="e.g. CGH-2026-0143"
          className="w-full rounded-xl border border-emerald-900/15 bg-emerald-50/20 px-4 py-3 font-mono text-base sm:text-sm tracking-wide text-emerald-950 placeholder:text-emerald-800/40 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none transition-all min-h-[46px]"
        />
      </div>

      <div>
        <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-950/80 mb-1.5">
          <Mail className="w-3.5 h-3.5 text-amber-600" />
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-emerald-900/15 bg-emerald-50/20 px-4 py-3 text-base sm:text-sm text-emerald-950 placeholder:text-emerald-800/40 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none transition-all min-h-[46px]"
        />
      </div>

      {error && (
        <div role="alert" className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-up">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-semibold min-h-[48px] py-3 px-4 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >

        {loading ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            Verifying…
          </>
        ) : (
          <>
            Redeem certificate
            <ArrowRight className="h-4 w-4 text-white" />
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-800/60 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
        Matched securely against verified records.
      </p>
    </form>
  );
}
