/**
 * Users Schema
 * Defines the users table for authentication and profiles
 */

import {
	pgTable,
	uuid,
	varchar,
	boolean,
	timestamp,
	text,
} from "drizzle-orm/pg-core";

// {{{ Users Table
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: varchar("email", { length: 255 }).unique().notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	role: varchar("role", { length: 20 }).default("user").notNull(), // user, researcher, admin
	avatar: text("avatar"), // URL to avatar image
	isVerified: boolean("is_verified").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// }}}

// {{{ Type Exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
// }}}
