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
  const [wantsMore, setWantsMore] = useState(false);
  const [topics, setTopics] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniqueId: participant.uniqueId,
          email: participant.email,
          wantsMoreSessions: wantsMore,
          requestedTopics: topics.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Couldn't save feedback.", "error");
      } else {
        setFeedbackSubmitted(true);
        showToast("Your training feedback has been saved!", "success");
      }
    } catch {
      showToast("Couldn't connect to save feedback.", "error");
    } finally {
      setSubmittingFeedback(false);
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

        {/* Training Feedback Section */}
        <div className="mt-7 pt-6 border-t border-slate-100">
          <form onSubmit={handleFeedbackSubmit} className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5">
            <div className="flex items-start gap-3">
              <input
                id="wants-more"
                type="checkbox"
                checked={wantsMore}
                onChange={(e) => {
                  setWantsMore(e.target.checked);
                  if (!e.target.checked) setFeedbackSubmitted(false);
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20 accent-amber-600 cursor-pointer shrink-0"
              />
              <label htmlFor="wants-more" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer leading-snug">
                I would like to attend more training sessions like this in the future.
              </label>
            </div>

            {wantsMore && (
              <div className="space-y-3 pt-1 animate-fade-up">
                <label htmlFor="topics-input" className="block text-xs font-medium text-slate-600">
                  What topics would you like future training on?
                </label>
                <textarea
                  id="topics-input"
                  rows={3}
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. Advanced Data Analysis, Cybersecurity, AI Tools, Cloud Management..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/15 transition-all resize-none"
                />

                <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                  {feedbackSubmitted ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Feedback saved! Thank you.
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium min-h-[38px] px-4 py-2 transition-colors disabled:opacity-60 ml-auto"
                  >
                    {submittingFeedback ? (
                      <>
                        <Spinner className="h-3.5 w-3.5 text-white" /> Saving…
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );


}
