/**
 * Global Error Handler Middleware
 */

import { Elysia } from "elysia";

// {{{ Error Handler
export const errorHandler = new Elysia({ name: "error-handler" }).onError(
	({ code, error, set }) => {
		console.error(`[Error] ${code}:`, error);

		switch (code) {
			case "NOT_FOUND":
				set.status = 404;
				return {
					success: false,
					error: "Resource not found",
				};

			case "VALIDATION":
				set.status = 400;
				return {
					success: false,
					error: "Validation error",
					details: error.message,
				};

			case "PARSE":
				set.status = 400;
				return {
					success: false,
					error: "Invalid request body",
				};

			case "INTERNAL_SERVER_ERROR":
				set.status = 500;
				return {
					success: false,
					error: "Internal server error",
				};

			default:
				set.status = 500;
				return {
					success: false,
					error: "An unexpected error occurred",
				};
		}
	}
);
// }}}

export default errorHandler;
