/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type User, type NewUser } from "../db/schema";
import { hashPassword, verifyPassword } from "../utils/hash";
import type { UserProfile, AuthResponse } from "../types/user";

// {{{ Transform User to Profile
export function toUserProfile(user: User): UserProfile {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
		avatar: user.avatar,
		isVerified: user.isVerified,
		createdAt: user.createdAt,
	};
}
// }}}

// {{{ Find User by Email
export async function findUserByEmail(email: string): Promise<User | null> {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.email, email.toLowerCase()))
		.limit(1);

	return result[0] ?? null;
}
// }}}

// {{{ Find User by ID
export async function findUserById(id: string): Promise<User | null> {
	const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

	return result[0] ?? null;
}
// }}}

// {{{ Create User
export async function createUser(data: {
	email: string;
	password: string;
	name: string;
}): Promise<User> {
	const passwordHash = await hashPassword(data.password);

	const newUser: NewUser = {
		email: data.email.toLowerCase(),
		passwordHash,
		name: data.name,
		role: "user",
		isVerified: false,
	};

	const result = await db.insert(users).values(newUser).returning();

	return result[0];
}
// }}}

// {{{ Validate Credentials
export async function validateCredentials(
	email: string,
	password: string
): Promise<User | null> {
	const user = await findUserByEmail(email);

	if (!user) {
		return null;
	}

	const isValid = await verifyPassword(password, user.passwordHash);

	if (!isValid) {
		return null;
	}

	return user;
}
// }}}

// {{{ Update User Profile
export async function updateUserProfile(
	userId: string,
	data: Partial<Pick<User, "name" | "avatar">>
): Promise<User | null> {
	const result = await db
		.update(users)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId))
		.returning();

	return result[0] ?? null;
}
// }}}

// {{{ Auth Service Export
export const authService = {
	findUserByEmail,
	findUserById,
	createUser,
	validateCredentials,
	updateUserProfile,
	toUserProfile,
};
// }}}

export default authService;
