import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. NEVER import this into a client component
 * or expose SUPABASE_SERVICE_ROLE_KEY to the browser — it bypasses RLS.
 *
 * Used by:
 *  - /api/verify and /api/download, to look up a participant by
 *    unique_id + email without granting the public anon key any
 *    direct table access.
 *  - /api/admin/*, after the caller's admin session has already been
 *    verified server-side.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export const CERTIFICATES_BUCKET = process.env.CERTIFICATES_BUCKET || "certificates";
