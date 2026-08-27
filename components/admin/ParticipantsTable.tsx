"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Trash2, FileX2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import { Spinner } from "@/components/ui/Spinner";

export interface Participant {
  id: string;
  name: string;
  email: string;
  unique_id: string;
  status: "pending" | "downloaded";
  upload_date: string;
  file_path: string | null;
}

function StatusPill({ status }: { status: Participant["status"] }) {
  if (status === "downloaded") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-50 text-ok px-2.5 py-1 text-xs font-medium">
        <CheckCircle2 className="h-3 w-3" />
        Downloaded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-50 text-warn px-2.5 py-1 text-xs font-medium">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

export function ParticipantsTable({
  participants,
  onChanged,
}: {
  participants: Participant[];
  onChanged: () => void;
}) {
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(p: Participant) {
    if (!confirm(`Remove ${p.name} (${p.unique_id})? This can't be undone.`)) return;
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/admin/participants/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Couldn't remove participant.", "error");
      } else {
        showToast(`${p.name} removed.`, "success");
        onChanged();
      }
    } catch {
      showToast("Couldn't remove participant.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (participants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white flex flex-col items-center justify-center gap-2 py-20 text-ink-faint">
        <FileX2 className="h-6 w-6" />
        <p className="text-sm">No participants match yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line-soft bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line-soft text-left text-xs uppercase tracking-wider text-ink-faint">
            <th className="px-5 py-3.5 font-medium">Name</th>
            <th className="px-5 py-3.5 font-medium">Email</th>
            <th className="px-5 py-3.5 font-medium">Unique ID</th>
            <th className="px-5 py-3.5 font-medium">Upload Date</th>
            <th className="px-5 py-3.5 font-medium">Status</th>
            <th className="px-5 py-3.5 font-medium sr-only">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr
              key={p.id}
              className="border-b border-line-soft last:border-0 hover:bg-bone/60 transition-colors group"
            >
              <td className="px-5 py-3.5 font-medium text-ink">{p.name}</td>
              <td className="px-5 py-3.5 text-ink-soft">{p.email}</td>
              <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{p.unique_id}</td>
              <td className="px-5 py-3.5 text-ink-soft">
                {new Date(p.upload_date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-5 py-3.5">
                <StatusPill status={p.status} />
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center h-8 w-8 rounded-md text-ink-faint hover:text-seal hover:bg-seal-50 transition-all disabled:opacity-100"
                  aria-label={`Remove ${p.name}`}
                >
                  {deletingId === p.id ? <Spinner className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
