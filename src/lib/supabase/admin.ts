import { createClient } from "@supabase/supabase-js";

// Service-role client for privileged server-only operations (e.g. storage
// uploads) that must bypass RLS. Never import this from client components —
// callers are responsible for checking `requireAdminUser()` first.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
