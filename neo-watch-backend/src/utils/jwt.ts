/**
 * JWT Utilities
 * Helper functions for JWT token operations
 */

import { env } from "../config/env";

// {{{ Token Payload Interface
export interface TokenPayload {
	userId: string;
	email: string;
	role: string;
}
// }}}

// {{{ Parse JWT Expiry to Seconds
export function parseExpiryToSeconds(expiry: string): number {
	const match = expiry.match(/^(\d+)([smhd])$/);
	if (!match) {
		return 60 * 60 * 24 * 7; // Default 7 days
	}

	const value = parseInt(match[1], 10);
	const unit = match[2];

	switch (unit) {
		case "s":
			return value;
		case "m":
			return value * 60;
		case "h":
			return value * 60 * 60;
		case "d":
			return value * 60 * 60 * 24;
		default:
			return 60 * 60 * 24 * 7;
	}
}
// }}}

// {{{ Get JWT Expiry Time
export function getJwtExpirySeconds(): number {
	return parseExpiryToSeconds(env.JWT_EXPIRES_IN);
}
// }}}
