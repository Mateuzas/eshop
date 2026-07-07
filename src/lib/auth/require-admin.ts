import { eq } from "drizzle-orm";

import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";

/**
 * Verifies the current session belongs to an admin, for use inside admin
 * server actions. `src/proxy.ts` already gates the `/admin/*` routes
 * themselves — this is a second check at the mutation boundary so actions
 * stay safe even if called directly.
 */
export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [profile] = await getDb()
    .select({ role: schema.profiles.role })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, user.id));

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}
