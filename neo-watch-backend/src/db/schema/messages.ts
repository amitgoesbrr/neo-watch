/**
 * Chat Messages Schema
 * Stores real-time chat messages for asteroid discussions
 */

import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { asteroids } from "./asteroids";

// {{{ Chat Messages Table
export const chatMessages = pgTable(
	"chat_messages",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		asteroidId: varchar("asteroid_id", { length: 50 }).notNull(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("chat_asteroid_idx").on(table.asteroidId),
		index("chat_created_at_idx").on(table.createdAt),
	]
);
// }}}

// {{{ Chat Messages Relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
	user: one(users, {
		fields: [chatMessages.userId],
		references: [users.id],
	}),
	asteroid: one(asteroids, {
		fields: [chatMessages.asteroidId],
		references: [asteroids.id],
	}),
}));
// }}}

// {{{ Type Exports
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
// }}}
