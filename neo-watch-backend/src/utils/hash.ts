/**
 * Password Hashing Utilities
 * Secure password hashing and verification using bcrypt
 */

import bcrypt from "bcryptjs";

// {{{ Constants
const SALT_ROUNDS = 12;
// }}}

// {{{ Hash Password
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}
// }}}

// {{{ Verify Password
export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}
// }}}
