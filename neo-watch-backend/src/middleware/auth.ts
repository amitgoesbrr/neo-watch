/**
 * Authentication Middleware
 * JWT verification and user context injection
 */

import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { env } from "../config/env";
import { findUserById } from "../services/auth";

// {{{ Token Payload Interface
export interface TokenPayload {
	userId: string;
	email: string;
	role: string;
}
// }}}

// {{{ User Context Interface
export interface UserContext {
	id: string;
	email: string;
	name: string;
	role: string;
}
// }}}

// {{{ JWT Plugin Configuration
export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
	jwt({
		name: "jwt",
		secret: env.JWT_SECRET,
		exp: env.JWT_EXPIRES_IN,
	})
);
// }}}

// {{{ Auth Guard Middleware
export const authGuard = new Elysia({ name: "auth-guard" })
	.use(jwtPlugin)
	.use(bearer())
	.derive({ as: "scoped" }, async ({ jwt, bearer }) => {
		if (!bearer) {
			return {
				user: null as UserContext | null,
				isAuthenticated: false,
			};
		}

		try {
			const payload = (await jwt.verify(bearer)) as TokenPayload | false;

			if (!payload) {
				return {
					user: null as UserContext | null,
					isAuthenticated: false,
				};
			}

			// Fetch full user from database
			const dbUser = await findUserById(payload.userId);

			if (!dbUser) {
				return {
					user: null as UserContext | null,
					isAuthenticated: false,
				};
			}

			return {
				user: {
					id: dbUser.id,
					email: dbUser.email,
					name: dbUser.name,
					role: dbUser.role,
				} as UserContext,
				isAuthenticated: true,
			};
		} catch {
			return {
				user: null as UserContext | null,
				isAuthenticated: false,
			};
		}
	});
// }}}

// {{{ Require Auth Helper
export function requireAuth(
	user: UserContext | null,
	isAuthenticated: boolean
): { authorized: false; response: object } | { authorized: true } {
	if (!isAuthenticated || !user) {
		return {
			authorized: false,
			response: {
				success: false,
				error: "Unauthorized - Please login to access this resource",
			},
		};
	}
	return { authorized: true };
}
// }}}

export default authGuard;
