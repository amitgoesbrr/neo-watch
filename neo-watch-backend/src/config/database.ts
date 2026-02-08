/**
 * Database configuration
 * Sets up PostgreSQL connection using postgres.js and Drizzle ORM
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";

// {{{ PostgreSQL Client
const queryClient = postgres(env.DATABASE_URL, {
	max: 10, // Maximum connections in pool
	idle_timeout: 20, // Close idle connections after 20 seconds
	connect_timeout: 10, // Connection timeout
});
// }}}

// {{{ Drizzle Instance
export const db = drizzle(queryClient);
// }}}

// {{{ Close Connection
export async function closeDatabase() {
	await queryClient.end();
}
// }}}

export default db;
