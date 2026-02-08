/**
 * Environment configuration
 * Loads and validates environment variables
 */

// {{{ Environment Variables Interface
interface EnvConfig {
	// Server
	PORT: number;
	NODE_ENV: "development" | "production" | "test";

	// Database
	DATABASE_URL: string;

	// NASA API
	NASA_API_KEY: string;
	NASA_API_BASE_URL: string;

	// JWT
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;

	// Redis (optional)
	REDIS_URL?: string;

	// CORS
	FRONTEND_URL: string;
}
// }}}

// {{{ Get Environment Variable
function getEnvVar(key: string, defaultValue?: string): string {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
// }}}

// {{{ Environment Configuration Export
export const env: EnvConfig = {
	// Server
	PORT: parseInt(getEnvVar("PORT", "4000"), 10),
	NODE_ENV: getEnvVar("NODE_ENV", "development") as EnvConfig["NODE_ENV"],

	// Database
	DATABASE_URL: getEnvVar(
		"DATABASE_URL",
		"postgresql://neo_user:neo_password@localhost:5432/neo_watch"
	),

	// NASA API
	NASA_API_KEY: getEnvVar("NASA_API_KEY", "DEMO_KEY"),
	NASA_API_BASE_URL: getEnvVar(
		"NASA_API_BASE_URL",
		"https://api.nasa.gov/neo/rest/v1"
	),

	// JWT
	JWT_SECRET: getEnvVar("JWT_SECRET", "dev-secret-change-in-production"),
	JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "7d"),

	// Redis (optional)
	REDIS_URL: process.env.REDIS_URL,

	// CORS
	FRONTEND_URL: getEnvVar("FRONTEND_URL", "http://localhost:3000"),
};
// }}}

export default env;
