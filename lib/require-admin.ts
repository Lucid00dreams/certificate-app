import { createClient } from "@/lib/supabase/server";

/**
 * Confirms the request carries a valid Supabase auth session (set by
 * /admin/login via the browser client + middleware). Route handlers
 * under /api/admin/* call this first and bail out on `null`.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
