"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ParticipantsTable, type Participant } from "@/components/admin/ParticipantsTable";
import { AddParticipantModal } from "@/components/admin/AddParticipantModal";
import { useToast } from "@/lib/toast-context";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/participants");
      const data = await res.json();
      if (res.ok) setParticipants(data.participants);
      else showToast(data.error || "Couldn't load participants.", "error");
    } catch {
      showToast("Couldn't load participants.", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = participants.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.unique_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] w-full min-w-0">

      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[26px] text-ink">Participants</h1>
          <p className="text-sm text-ink-soft mt-1">
            {participants.length} record{participants.length === 1 ? "" : "s"} · manage
            certificates and track download status.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink text-white text-sm font-medium px-4 py-2.5 hover:bg-ink/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Participant
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or ID"
          className="w-full rounded-lg border border-line bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brass focus:shadow-[0_0_0_3px_rgba(169,130,76,0.15)] transition-shadow"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 text-ink-soft py-20">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Loading participants…</span>
        </div>
      ) : (
        <ParticipantsTable participants={filtered} onChanged={load} />
      )}

      <AddParticipantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          load();
        }}
      />
    </div>
  );
}
