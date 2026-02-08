/**
 * Alerts Schema
 * Stores user notifications for close approach events
 */

import {
	pgTable,
	uuid,
	varchar,
	text,
	boolean,
	timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { asteroids } from "./asteroids";

// {{{ Alert Types
export type AlertType =
	| "close_approach"
	| "hazard_update"
	| "watchlist_update"
	| "system";
// }}}

// {{{ Alerts Table
export const alerts = pgTable("alerts", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	asteroidId: varchar("asteroid_id", { length: 50 }).references(
		() => asteroids.id,
		{ onDelete: "set null" }
	),
	type: varchar("type", { length: 50 }).$type<AlertType>().notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	message: text("message").notNull(),
	isRead: boolean("is_read").default(false),
	scheduledFor: timestamp("scheduled_for"), // For scheduled alerts
	sentAt: timestamp("sent_at"), // When the alert was actually sent
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
// }}}

// {{{ Alerts Relations
export const alertsRelations = relations(alerts, ({ one }) => ({
	user: one(users, {
		fields: [alerts.userId],
		references: [users.id],
	}),
	asteroid: one(asteroids, {
		fields: [alerts.asteroidId],
		references: [asteroids.id],
	}),
}));
// }}}

// {{{ Type Exports
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
// }}}
