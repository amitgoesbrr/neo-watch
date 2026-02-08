/**
 * Database Client Export
 * Main entry point for database operations
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schema";

// {{{ PostgreSQL Client
const queryClient = postgres(env.DATABASE_URL, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
});
// }}}

// {{{ Drizzle Instance with Schema
export const db = drizzle(queryClient, { schema });
// }}}

// {{{ Close Connection
export async function closeDatabase() {
	await queryClient.end();
}
// }}}

// Re-export schema for convenience
export * from "./schema";

export default db;
