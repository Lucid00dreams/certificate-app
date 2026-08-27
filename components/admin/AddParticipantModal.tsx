"use client";

import { useEffect, useRef, useState } from "react";
import { X, UploadCloud, FileText } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { Spinner } from "@/components/ui/Spinner";

export function AddParticipantModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setUniqueId("");
      setFile(null);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function handleFile(f: File | null) {
    if (f && f.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !uniqueId.trim()) {
      setError("Name, email, and Unique ID are all required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("uniqueId", uniqueId.trim());
      if (file) formData.append("file", file);

      const res = await fetch("/api/admin/participants", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't add participant.");
        setSubmitting(false);
        return;
      }

      showToast(`${name.trim()} added.`, "success");
      onCreated();
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-card-lg animate-fade-up">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line-soft sticky top-0 bg-white z-10">
          <h2 className="font-display text-base sm:text-lg text-ink">Add Participant</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-faint hover:text-ink hover:bg-bone transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">
          <div>
            <label htmlFor="p-name" className="block text-xs font-medium uppercase tracking-wider text-ink-soft mb-1.5">
              Full name
            </label>
            <input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-brass focus:shadow-[0_0_0_3px_rgba(169,130,76,0.15)] transition-shadow min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="p-email" className="block text-xs font-medium uppercase tracking-wider text-ink-soft mb-1.5">
                Email
              </label>
              <input
                id="p-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-brass focus:shadow-[0_0_0_3px_rgba(169,130,76,0.15)] transition-shadow min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="p-uid" className="block text-xs font-medium uppercase tracking-wider text-ink-soft mb-1.5">
                Unique ID
              </label>
              <input
                id="p-uid"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                placeholder="CGH-2026-0143"
                className="w-full rounded-lg border border-line px-3.5 py-2.5 text-base sm:text-sm font-mono outline-none focus:border-brass focus:shadow-[0_0_0_3px_rgba(169,130,76,0.15)] transition-shadow min-h-[44px]"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-soft mb-1.5">
              Certificate PDF
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`rounded-lg border border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                dragging ? "border-brass bg-brass-50" : "border-line bg-bone hover:bg-line-soft/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-ink">
                  <FileText className="h-4 w-4 text-brass" />
                  {file.name}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-ink-faint">
                  <UploadCloud className="h-5 w-5" />
                  <p className="text-xs">Click to browse or drag a PDF here</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-seal bg-seal-50 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-bone transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-ink/90 transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" /> Adding…
                </>
              ) : (
                "Add Participant"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
