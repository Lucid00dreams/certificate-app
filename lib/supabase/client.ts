import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase instance. Used only for the admin auth session
 * (sign in / sign out) in client components. All data reads/writes for
 * participants go through server route handlers — the anon key never
 * touches the participants table directly.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
