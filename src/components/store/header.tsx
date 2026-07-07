import { eq } from "drizzle-orm";

import { createClient } from "@/lib/supabase/server";
import { getDb, schema } from "@/lib/db";
import { HeaderBar } from "./header-bar";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const [profile] = await getDb()
      .select({ role: schema.profiles.role })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id));
    isAdmin = profile?.role === "admin";
  }

  return <HeaderBar isLoggedIn={!!user} isAdmin={isAdmin} />;
}
