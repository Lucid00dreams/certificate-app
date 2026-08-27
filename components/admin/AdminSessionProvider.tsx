"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Clock } from "lucide-react";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const WARNING_MS = 4 * 60 * 1000; // 4 minutes (warning triggers with 1 min left)
const ACTIVITY_COOKIE = "admin_last_activity";

function getStoredActivity(): number {
  if (typeof window === "undefined") return Date.now();
  const localVal = localStorage.getItem(ACTIVITY_COOKIE);
  if (localVal) {
    const parsed = parseInt(localVal, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACTIVITY_COOKIE}=([^;]*)`));
  if (match && match[1]) {
    const parsed = parseInt(decodeURIComponent(match[1]), 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return Date.now();
}

function setStoredActivity(timestamp: number) {
  if (typeof window === "undefined") return;
  const str = timestamp.toString();
  localStorage.setItem(ACTIVITY_COOKIE, str);
  // Set cookie valid across site, max-age 1 day
  document.cookie = `${ACTIVITY_COOKIE}=${str}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function clearStoredActivity() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVITY_COOKIE);
  document.cookie = `${ACTIVITY_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [warningSeconds, setWarningSeconds] = useState<number | null>(null);
  const isSigningOutRef = useRef(false);
  const lastUpdateRef = useRef<number>(Date.now());

  const handleSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    clearStoredActivity();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore auth errors during signout
    }
    router.push("/admin/login?reason=timeout");
    router.refresh();
  }, [router]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    // Throttle activity updates to once every 2 seconds
    if (now - lastUpdateRef.current < 2000) return;
    lastUpdateRef.current = now;
    setStoredActivity(now);
    setWarningSeconds(null);
  }, []);

  const resetActivityManually = useCallback(() => {
    const now = Date.now();
    lastUpdateRef.current = now;
    setStoredActivity(now);
    setWarningSeconds(null);
  }, []);

  // Track user activity events
  useEffect(() => {
    // Initialize activity timestamp if not present
    const existing = getStoredActivity();
    const now = Date.now();
    if (now - existing > TIMEOUT_MS) {
      handleSignOut();
      return;
    }
    setStoredActivity(now);
    lastUpdateRef.current = now;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handleUserActivity = () => {
      updateActivity();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [updateActivity, handleSignOut]);

  // Check timeout periodically & on tab focus/visibility change
  useEffect(() => {
    const checkTimeout = () => {
      if (isSigningOutRef.current) return;
      const last = getStoredActivity();
      const elapsed = Date.now() - last;

      if (elapsed >= TIMEOUT_MS) {
        handleSignOut();
      } else if (elapsed >= WARNING_MS) {
        const remainingSec = Math.ceil((TIMEOUT_MS - elapsed) / 1000);
        setWarningSeconds(remainingSec);
      } else {
        setWarningSeconds(null);
      }
    };

    const interval = setInterval(checkTimeout, 2000);

    const handleVisibilityOrFocus = () => {
      checkTimeout();
    };

    window.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [handleSignOut]);

  return (
    <>
      {children}

      {warningSeconds !== null && (
        <div className="fixed bottom-4 right-4 z-[200] max-w-md w-full p-4 bg-ink text-white rounded-xl shadow-card-lg border border-brass/30 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brass/20 rounded-lg text-brass-soft shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Session Inactivity Warning
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                You will be automatically signed out in{" "}
                <span className="font-mono font-bold text-brass-soft">{warningSeconds}s</span> due to 5 minutes of inactivity.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={resetActivityManually}
                  className="px-3 py-1.5 bg-brass text-ink font-medium text-xs rounded-md hover:bg-brass-light transition-colors"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
