import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    // `prepare: false` is required when connecting through Supabase's
    // transaction-mode pooler (port 6543), which doesn't support
    // prepared statements.
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Re-export for convenience — but use getDb() in route handlers
export { schema };
