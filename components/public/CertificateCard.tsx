"use client";

import { useState } from "react";
import { Download, FileWarning, CheckCircle2 } from "lucide-react";
import { Seal } from "@/components/ui/Seal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/lib/toast-context";

interface Participant {
  name: string;
  email: string;
  uniqueId: string;
  status: string;
  uploadDate: string;
  hasFile: boolean;
}

export function CertificateCard({
  participant,
  previewUrl,
}: {
  participant: Participant;
  previewUrl: string | null;
}) {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueId: participant.uniqueId, email: participant.email }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Download failed. Try again.", "error");
        return;
      }

      const fileRes = await fetch(data.url);
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      showToast("Certificate downloaded successfully.", "success");
    } catch {
      showToast("Couldn't download the file. Check your connection.", "error");
    } finally {
      setDownloading(false);
    }
  }

  const formattedDate = new Date(participant.uploadDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden animate-fade-up">
      {/* Header Badge */}
      <div className="flex flex-col items-center text-center px-4 sm:px-8 pt-7 sm:pt-9 pb-6 sm:pb-7 border-b border-slate-100 bg-slate-50/50">
        <Seal size={60} animate />
        
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified Certificate
        </div>

        <h1 className="mt-3.5 font-display text-xl sm:text-3xl font-bold text-slate-900 text-balance leading-snug">
          Hi {participant.name},
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed text-balance max-w-md">
          Thank you for attending today&apos;s training! We&apos;re glad you could make it.
        </p>

        <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] sm:text-xs tracking-wider font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            ID: {participant.uniqueId}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-500">Issued {formattedDate}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 sm:py-7">
        {participant.hasFile && previewUrl ? (
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3] sm:aspect-[1.414/1] mb-5 sm:mb-6 shadow-inner">
            <iframe
              src={previewUrl}
              title={`Landscape certificate preview for ${participant.name}`}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 py-10 sm:py-14 mb-5 sm:mb-6 text-slate-500 text-center px-4">
            <FileWarning className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">Your certificate PDF has not been uploaded by the admin yet.</p>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={downloading || !participant.hasFile}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-sm font-semibold min-h-[48px] py-3 px-4 transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Spinner className="h-4 w-4" />
              Preparing your file…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF Certificate
            </>
          )}
        </button>
      </div>
    </div>
  );

}
