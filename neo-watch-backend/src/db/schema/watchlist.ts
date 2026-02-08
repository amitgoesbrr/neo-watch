/**
 * Watchlist Schema
 * Tracks user's watched asteroids with custom settings
 */

import {
	pgTable,
	uuid,
	varchar,
	text,
	boolean,
	doublePrecision,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { asteroids } from "./asteroids";

// {{{ Watchlist Table
export const watchlist = pgTable(
	"watchlist",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		asteroidId: varchar("asteroid_id", { length: 50 })
			.references(() => asteroids.id, { onDelete: "cascade" })
			.notNull(),
		nickname: varchar("nickname", { length: 100 }), // Custom name for the asteroid
		notes: text("notes"), // User notes about the asteroid
		alertEnabled: boolean("alert_enabled").default(true),
		alertThresholdKm: doublePrecision("alert_threshold_km").default(7500000), // ~0.05 AU
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("unique_user_asteroid").on(table.userId, table.asteroidId),
	]
);
// }}}

// {{{ Watchlist Relations
export const watchlistRelations = relations(watchlist, ({ one }) => ({
	user: one(users, {
		fields: [watchlist.userId],
		references: [users.id],
	}),
	asteroid: one(asteroids, {
		fields: [watchlist.asteroidId],
		references: [asteroids.id],
	}),
}));
// }}}

// {{{ Type Exports
export type WatchlistItem = typeof watchlist.$inferSelect;
export type NewWatchlistItem = typeof watchlist.$inferInsert;
// }}}
