"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, LogOut } from "lucide-react";
import { Seal } from "@/components/ui/Seal";
import { createClient } from "@/lib/supabase/client";
import { clearStoredActivity } from "@/components/admin/AdminSessionProvider";

export function Sidebar({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();

  async function handleSignOut() {
    clearStoredActivity();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }


  return (
    <aside className="w-full md:w-64 shrink-0 bg-ink text-white flex flex-col md:h-screen md:sticky md:top-0">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Seal size={22} />
          <span className="font-display text-[15px] tracking-wide font-semibold">Admin</span>
        </div>
        <button
          onClick={handleSignOut}
          className="md:hidden inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors border border-white/15"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>

      <nav className="px-3 py-3 md:py-5 flex md:flex-col gap-2 overflow-x-auto">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-white/10 text-sm font-medium shrink-0">
          <LayoutGrid className="h-4 w-4 text-brass-soft" />
          Participants
        </div>
      </nav>

      <div className="hidden md:block px-3 pb-5 pt-3 border-t border-white/10 mt-auto">
        <div className="px-3 pb-3">
          <p className="text-[11px] uppercase tracking-wider text-white/40">Signed in as</p>
          <p className="text-sm truncate">{adminEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

}
