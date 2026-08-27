"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, LockKeyhole, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminLoginPage() {
  // useSearchParams() (for the post-login "next" redirect) requires a
  // Suspense boundary during static generation.
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTimeout = searchParams.get("reason") === "timeout";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Incorrect email or password.");
        setLoading(false);
        return;
      }

      // Initialize session activity timestamp
      const nowStr = Date.now().toString();
      localStorage.setItem("admin_last_activity", nowStr);
      document.cookie = `admin_last_activity=${nowStr}; Path=/; Max-Age=86400; SameSite=Lax`;

      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("Unable to connect to authentication service. Please check your credentials and internet connection.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-ink text-slate-900">
      <div className="w-full max-w-[360px] sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3.5 shadow-inner">
            <LockKeyhole className="h-6 w-6 text-brass-soft" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-white/60">
            Sign in to manage participants and certificates.
          </p>
        </div>

        {isTimeout && (
          <div className="mb-4 p-4 rounded-xl bg-brass/15 border border-brass/30 text-white flex items-start gap-3 text-xs leading-relaxed animate-fade-up">
            <Clock className="h-4 w-4 text-brass-soft shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brass-soft">Session Timed Out</p>
              <p className="text-white/80 mt-0.5">
                You were automatically signed out after 5 minutes of inactivity. Please sign in again to continue.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 space-y-4 border border-white/20"
        >
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-4 py-3 text-base sm:text-sm text-slate-900 outline-none focus:border-amber-600 focus:ring-3 focus:ring-amber-600/15 transition-all min-h-[48px]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-4 py-3 text-base sm:text-sm text-slate-900 outline-none focus:border-amber-600 focus:ring-3 focus:ring-amber-600/15 transition-all min-h-[48px]"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 leading-snug">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-semibold min-h-[48px] py-3 px-4 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-60 shadow-md shadow-slate-900/10"
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4 text-white" /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
