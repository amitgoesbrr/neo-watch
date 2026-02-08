/**
 * Authentication Routes
 * Handles user registration, login, logout, and profile
 */

import { Elysia, t } from "elysia";
import { jwtPlugin, authGuard } from "../middleware/auth";
import {
	createUser,
	findUserByEmail,
	validateCredentials,
	toUserProfile,
} from "../services/auth";
import { registerSchema, loginSchema } from "../utils/validators";

// {{{ Auth Routes
export const authRoutes = new Elysia({ prefix: "/auth" })
	.use(jwtPlugin)

	// {{{ POST /auth/register
	.post(
		"/register",
		async ({ body, jwt, set }) => {
			const { email, password, name } = body;

			// Check if user already exists
			const existingUser = await findUserByEmail(email);
			if (existingUser) {
				set.status = 409;
				return {
					success: false,
					error: "User with this email already exists",
				};
			}

			try {
				// Create new user
				const user = await createUser({ email, password, name });

				// Generate JWT token
				const token = await jwt.sign({
					userId: user.id,
					email: user.email,
					role: user.role,
				});

				return {
					success: true,
					data: {
						user: toUserProfile(user),
						token,
					},
					message: "Registration successful",
				};
			} catch (error) {
				console.error("Registration error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Failed to create user",
				};
			}
		},
		{
			body: registerSchema,
			detail: {
				tags: ["Auth"],
				summary: "Register a new user",
			},
		}
	)
	// }}}

	// {{{ POST /auth/login
	.post(
		"/login",
		async ({ body, jwt, set }) => {
			const { email, password } = body;

			try {
				// Validate credentials
				const user = await validateCredentials(email, password);

				if (!user) {
					set.status = 401;
					return {
						success: false,
						error: "Invalid email or password",
					};
				}

				// Generate JWT token
				const token = await jwt.sign({
					userId: user.id,
					email: user.email,
					role: user.role,
				});

				return {
					success: true,
					data: {
						user: toUserProfile(user),
						token,
					},
					message: "Login successful",
				};
			} catch (error) {
				console.error("Login error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Login failed",
				};
			}
		},
		{
			body: loginSchema,
			detail: {
				tags: ["Auth"],
				summary: "Login with email and password",
			},
		}
	)
	// }}}

	// {{{ GET /auth/me - Get current user
	.use(authGuard)
	.get(
		"/me",
		async ({ user, isAuthenticated, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return {
					success: false,
					error: "Not authenticated",
				};
			}

			return {
				success: true,
				data: {
					user,
				},
			};
		},
		{
			detail: {
				tags: ["Auth"],
				summary: "Get current authenticated user",
			},
		}
	)
	// }}}

	// {{{ POST /auth/logout
	.post(
		"/logout",
		async () => {
			// With JWT, logout is handled client-side by removing the token
			// This endpoint is for future use with token blacklisting
			return {
				success: true,
				message: "Logged out successfully",
			};
		},
		{
			detail: {
				tags: ["Auth"],
				summary: "Logout user",
			},
		}
	)
	// }}}

	// {{{ POST /auth/refresh - Refresh JWT token
	.post(
		"/refresh",
		async ({ user, isAuthenticated, jwt, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return {
					success: false,
					error: "Not authenticated",
				};
			}

			try {
				// Generate a new JWT token with the same user info
				const token = await jwt.sign({
					userId: user.id,
					email: user.email,
					role: user.role,
				});

				return {
					success: true,
					data: {
						token,
					},
					message: "Token refreshed successfully",
				};
			} catch (error) {
				console.error("Token refresh error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Failed to refresh token",
				};
			}
		},
		{
			detail: {
				tags: ["Auth"],
				summary: "Refresh JWT token",
			},
		}
	)
	// }}}

	// {{{ POST /auth/send-verification - Send verification email (simulated)
	.post(
		"/send-verification",
		async ({ user, isAuthenticated, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			// Simulate sending verification email
			// In production, this would integrate with a mail service
			console.log(`[SIMULATED] Sending verification email to ${user.email}`);

			return {
				success: true,
				message: "Verification email sent (simulated - no mail server configured)",
				data: {
					email: user.email,
					// In production, this would be a secure token sent via email
					simulatedToken: `verify-${user.id}-${Date.now()}`,
				},
			};
		},
		{
			detail: {
				tags: ["Auth"],
				summary: "Send email verification (simulated)",
			},
		}
	)
	// }}}

	// {{{ POST /auth/verify-email - Verify email with token (simulated)
	.post(
		"/verify-email",
		async ({ body, set }) => {
			const { token } = body;

			// Validate token format (simulated)
			if (!token || !token.startsWith("verify-")) {
				set.status = 400;
				return {
					success: false,
					error: "Invalid verification token",
				};
			}

			// In production, this would:
			// 1. Validate the token from database/redis
			// 2. Mark the user as verified
			// 3. Delete the token
			console.log(`[SIMULATED] Verifying email with token: ${token}`);

			// Extract user ID from simulated token
			const parts = token.split("-");
			if (parts.length < 3) {
				set.status = 400;
				return {
					success: false,
					error: "Invalid token format",
				};
			}

			const userId = parts[1];

			// Simulate database update
			// In production: await db.update(users).set({ isVerified: true }).where(eq(users.id, userId));
			console.log(`[SIMULATED] User ${userId} marked as verified`);

			return {
				success: true,
				message: "Email verified successfully (simulated)",
				data: {
					verified: true,
					userId,
				},
			};
		},
		{
			body: t.Object({
				token: t.String(),
			}),
			detail: {
				tags: ["Auth"],
				summary: "Verify email with token (simulated)",
			},
		}
	);
// }}}
// }}}

export default authRoutes;
