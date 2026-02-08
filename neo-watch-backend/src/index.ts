/**
 * Neo-Watch Backend
 * Main entry point for the Elysia server
 */

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { env } from "./config/env";
import { errorHandler } from "./middleware";
import {
	authRoutes,
	neoRoutes,
	userRoutes,
	alertRoutes,
	chatRoutes,
	wsRoutes,
} from "./routes";

// {{{ Create App Instance
const app = new Elysia()
	// {{{ Global Plugins
	.use(
		cors({
			origin: env.NODE_ENV === "development" 
				? true  // Allow all origins in development
				: env.FRONTEND_URL,
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
		})
	)
	.use(
		swagger({
			path: "/docs",
			documentation: {
				info: {
					title: "Neo-Watch API",
					version: "1.0.0",
					description:
						"API for tracking Near-Earth Objects and asteroid risk analysis",
				},
				tags: [
					{ name: "Auth", description: "Authentication endpoints" },
					{ name: "NEO", description: "Near-Earth Object data endpoints" },
					{ name: "User", description: "User profile and watchlist endpoints" },
					{ name: "Alerts", description: "Alert management endpoints" },
					{ name: "Chat", description: "Real-time chat endpoints" },
				],
			},
		})
	)
	.use(errorHandler)
	// }}}

	// {{{ Health Check
	.get("/", () => ({
		success: true,
		message: "🚀 Neo-Watch API is running",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	}))
	.get("/health", () => ({
		success: true,
		status: "healthy",
		timestamp: new Date().toISOString(),
	}))
	// }}}

	// {{{ API Routes
	.group("/api", (app) =>
		app
			.use(authRoutes)
			.use(neoRoutes)
			.use(userRoutes)
			.use(alertRoutes)
			.use(chatRoutes)
	)
	// }}}

	// {{{ WebSocket Routes
	.use(wsRoutes)
	// }}}

	// {{{ Start Server
	.listen(env.PORT);
// }}}
// }}}

import { startCronJobs } from "./jobs/cron";

// ... existing code ...

// {{{ Server Info
startCronJobs();

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🌌 NEO-WATCH API SERVER                                    ║
║                                                              ║
║   🚀 Server running at: http://${app.server?.hostname}:${app.server?.port}                 ║
║   📚 API Docs at: http://${app.server?.hostname}:${app.server?.port}/docs                  ║
║   🌍 Environment: ${env.NODE_ENV.padEnd(41)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
// }}}

export type App = typeof app;
export default app;
