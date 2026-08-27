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
    } catch (err: any) {
      setError("Unable to connect to Supabase. Please ensure your actual NEXT_PUBLIC_SUPABASE_URL is configured in .env.local.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-ink">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <LockKeyhole className="h-5 w-5 text-brass-soft" />
          </div>
          <h1 className="font-display text-2xl text-white">Admin sign in</h1>
          <p className="mt-1.5 text-sm text-white/50">
            Manage participants and certificate uploads.
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
          className="bg-white rounded-2xl shadow-card-lg p-7 space-y-4"
        >

          <div>
            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-ink-soft mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-4 py-3 text-base sm:text-sm text-ink outline-none focus:border-brass focus:shadow-[0_0_0_3px_rgba(169,130,76,0.15)] transition-shadow min-h-[46px]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-ink-soft mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-4 py-3 text-base sm:text-sm text-ink outline-none focus:border-brass focus:shadow-[0_0_0_3px_rgba(169,130,76,0.15)] transition-shadow min-h-[46px]"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-seal bg-seal-50 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-white text-sm font-medium min-h-[48px] py-3 px-4 hover:bg-ink/90 transition-colors disabled:opacity-60"
          >

            {loading ? (
              <>
                <Spinner className="h-4 w-4" /> Signing in…
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
