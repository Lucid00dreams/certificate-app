"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { CertificateCard } from "@/components/public/CertificateCard";

interface Participant {
  name: string;
  email: string;
  uniqueId: string;
  status: string;
  uploadDate: string;
  hasFile: boolean;
}

function CertificateLoadingCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 flex flex-col items-center gap-3 text-slate-600">
      <Spinner className="h-6 w-6 text-amber-600" />
      <p className="text-sm font-medium">Verifying your details…</p>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-12">
      <div className="w-full max-w-[720px]">

        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300"
          >
            <LogOut className="h-3.5 w-3.5 text-amber-600" />
            Sign out
          </Link>
        </div>

        <Suspense fallback={<CertificateLoadingCard />}>
          <CertificateLookup />
        </Suspense>
      </div>
    </main>
  );
}


function CertificateLookup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid") || "";
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !email) {
      router.replace("/");
      return;
    }

    let cancelled = false;
    async function verify() {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uniqueId: uid, email }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data.error || "We couldn't verify this certificate.");
        } else {
          setParticipant(data.participant);
          setPreviewUrl(data.previewUrl);
        }
      } catch {
        if (!cancelled) setError("Something went wrong loading your certificate.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    verify();
    return () => {
      cancelled = true;
    };
  }, [uid, email, router]);

  if (loading) return <CertificateLoadingCard />;

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <p className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-4"
        >
          Try again
        </Link>
      </div>
    );
  }

  if (!participant) return null;

  return <CertificateCard participant={participant} previewUrl={previewUrl} />;
}
