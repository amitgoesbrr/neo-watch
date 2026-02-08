import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema/index.ts",
	out: "./src/db/migrations",
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			"postgresql://neo_user:neo_password@localhost:5432/neo_watch",
	},
	verbose: true,
	strict: true,
});
