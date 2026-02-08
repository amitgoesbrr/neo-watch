/**
 * Input Validation Schemas
 * Elysia validation schemas for request bodies
 */

import { t } from "elysia";

// {{{ Auth Validators
export const registerSchema = t.Object({
	email: t.String({ format: "email" }),
	password: t.String({ minLength: 8, maxLength: 128 }),
	name: t.String({ minLength: 2, maxLength: 100 }),
});

export const loginSchema = t.Object({
	email: t.String({ format: "email" }),
	password: t.String({ minLength: 1 }),
});
// }}}

// {{{ User Profile Validators
export const updateProfileSchema = t.Object({
	name: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
	avatar: t.Optional(t.String()),
});
// }}}

// {{{ Watchlist Validators
export const addToWatchlistSchema = t.Object({
	asteroidId: t.String({ minLength: 1 }),
	nickname: t.Optional(t.String({ maxLength: 100 })),
	notes: t.Optional(t.String()),
	alertEnabled: t.Optional(t.Boolean()),
	alertThresholdKm: t.Optional(t.Number({ minimum: 0 })),
});

export const updateWatchlistSchema = t.Object({
	nickname: t.Optional(t.String({ maxLength: 100 })),
	notes: t.Optional(t.String()),
	alertEnabled: t.Optional(t.Boolean()),
	alertThresholdKm: t.Optional(t.Number({ minimum: 0 })),
});
// }}}

// {{{ NEO Query Validators
export const neoFeedQuerySchema = t.Object({
	start_date: t.Optional(t.String()), // YYYY-MM-DD format
	end_date: t.Optional(t.String()), // YYYY-MM-DD format
});

export const neoBrowseQuerySchema = t.Object({
	page: t.Optional(t.String()),
	size: t.Optional(t.String()),
});
// }}}

// {{{ Alert Validators
export const updateAlertSettingsSchema = t.Object({
	alertEnabled: t.Optional(t.Boolean()),
	alertThresholdKm: t.Optional(t.Number({ minimum: 0 })),
});
// }}}

// {{{ Chat Message Validators
export const sendMessageSchema = t.Object({
	content: t.String({ minLength: 1, maxLength: 2000 }),
});
// }}}
