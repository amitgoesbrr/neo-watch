/**
 * User Type Definitions
 */

// {{{ User Types
export interface UserProfile {
	id: string;
	email: string;
	name: string;
	role: string;
	avatar: string | null;
	isVerified: boolean;
	createdAt: Date;
}

export interface AuthUser {
	userId: string;
	email: string;
	role: string;
}
// }}}

// {{{ Auth Response Types
export interface AuthResponse {
	user: UserProfile;
	token: string;
}

export interface TokenPayload {
	userId: string;
	email: string;
	role: string;
}
// }}}
