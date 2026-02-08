/**
 * Alert Routes
 * Handles user notification management
 */

import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth";
import {
	getUserAlerts,
	getUnreadAlertCount,
	markAlertAsRead,
	markAllAlertsAsRead,
	deleteAlert,
} from "../services/alert";

// {{{ Alert Routes
export const alertRoutes = new Elysia({ prefix: "/alerts" })
	.use(authGuard)

	// {{{ GET /alerts - Get user alerts
	.get(
		"/",
		async ({ user, isAuthenticated, query, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const limit = parseInt(query.limit ?? "50", 10);
				const alerts = await getUserAlerts(user.id, limit);

				return {
					success: true,
					data: {
						count: alerts.length,
						alerts,
					},
				};
			} catch (error) {
				console.error("Alerts fetch error:", error);
				set.status = 500;
				return { success: false, error: "Failed to fetch alerts" };
			}
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Alerts"],
				summary: "Get user alerts",
			},
		}
	)
	// }}}

	// {{{ GET /alerts/unread - Get unread count
	.get(
		"/unread",
		async ({ user, isAuthenticated, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const count = await getUnreadAlertCount(user.id);

				return {
					success: true,
					data: {
						unreadCount: count,
					},
				};
			} catch (error) {
				console.error("Unread count error:", error);
				set.status = 500;
				return { success: false, error: "Failed to get unread count" };
			}
		},
		{
			detail: {
				tags: ["Alerts"],
				summary: "Get unread alert count",
			},
		}
	)
	// }}}

	// {{{ PUT /alerts/:id/read - Mark alert as read
	.put(
		"/:id/read",
		async ({ user, isAuthenticated, params, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const alert = await markAlertAsRead(params.id, user.id);

				if (!alert) {
					set.status = 404;
					return { success: false, error: "Alert not found" };
				}

				return {
					success: true,
					data: {
						alert,
					},
				};
			} catch (error) {
				console.error("Mark read error:", error);
				set.status = 500;
				return { success: false, error: "Failed to mark as read" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Alerts"],
				summary: "Mark alert as read",
			},
		}
	)
	// }}}

	// {{{ PUT /alerts/read-all - Mark all alerts as read
	.put(
		"/read-all",
		async ({ user, isAuthenticated, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const count = await markAllAlertsAsRead(user.id);

				return {
					success: true,
					data: {
						markedCount: count,
					},
					message: `Marked ${count} alerts as read`,
				};
			} catch (error) {
				console.error("Mark all read error:", error);
				set.status = 500;
				return { success: false, error: "Failed to mark all as read" };
			}
		},
		{
			detail: {
				tags: ["Alerts"],
				summary: "Mark all alerts as read",
			},
		}
	)
	// }}}

	// {{{ DELETE /alerts/:id - Delete alert
	.delete(
		"/:id",
		async ({ user, isAuthenticated, params, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const deleted = await deleteAlert(params.id, user.id);

				if (!deleted) {
					set.status = 404;
					return { success: false, error: "Alert not found" };
				}

				return {
					success: true,
					message: "Alert deleted",
				};
			} catch (error) {
				console.error("Delete alert error:", error);
				set.status = 500;
				return { success: false, error: "Failed to delete alert" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Alerts"],
				summary: "Delete an alert",
			},
		}
	)
	// }}}

	// {{{ PUT /alerts/settings - Update global alert settings
	.put(
		"/settings",
		async ({ user, isAuthenticated, body, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const { alertEnabled, alertThresholdKm } = body;
				
				// Import watchlist and db here to avoid circular deps at top level
				const { db } = await import("../db");
				const { watchlist } = await import("../db/schema");
				const { eq } = await import("drizzle-orm");

				// Build update object based on provided fields
				const updateData: { alertEnabled?: boolean; alertThresholdKm?: number } = {};
				if (alertEnabled !== undefined) updateData.alertEnabled = alertEnabled;
				if (alertThresholdKm !== undefined) updateData.alertThresholdKm = alertThresholdKm;

				if (Object.keys(updateData).length === 0) {
					return {
						success: true,
						message: "No settings to update",
					};
				}

				// Update all watchlist items for this user
				const result = await db
					.update(watchlist)
					.set(updateData)
					.where(eq(watchlist.userId, user.id))
					.returning();

				return {
					success: true,
					data: {
						updatedCount: result.length,
					},
					message: `Updated alert settings for ${result.length} watchlist items`,
				};
			} catch (error) {
				console.error("Alert settings error:", error);
				set.status = 500;
				return { success: false, error: "Failed to update alert settings" };
			}
		},
		{
			body: t.Object({
				alertEnabled: t.Optional(t.Boolean()),
				alertThresholdKm: t.Optional(t.Number({ minimum: 0 })),
			}),
			detail: {
				tags: ["Alerts"],
				summary: "Update global alert settings for all watchlist items",
			},
		}
	);
// }}}
// }}}

export default alertRoutes;
