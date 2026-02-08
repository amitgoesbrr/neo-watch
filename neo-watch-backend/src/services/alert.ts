/**
 * Alert Service
 * Handles alert creation, management, and notifications
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { alerts, type Alert, type NewAlert, type AlertType } from "../db/schema";

// {{{ Create Alert
export async function createAlert(data: NewAlert): Promise<Alert> {
	const result = await db.insert(alerts).values(data).returning();
	return result[0];
}
// }}}

// {{{ Get User Alerts
export async function getUserAlerts(
	userId: string,
	limit: number = 50
): Promise<Alert[]> {
	return db
		.select()
		.from(alerts)
		.where(eq(alerts.userId, userId))
		.orderBy(desc(alerts.createdAt))
		.limit(limit);
}
// }}}

// {{{ Get Unread Alert Count
export async function getUnreadAlertCount(userId: string): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(alerts)
		.where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)));

	return result[0]?.count ?? 0;
}
// }}}

// {{{ Mark Alert as Read
export async function markAlertAsRead(
	alertId: string,
	userId: string
): Promise<Alert | null> {
	const result = await db
		.update(alerts)
		.set({ isRead: true })
		.where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
		.returning();

	return result[0] ?? null;
}
// }}}

// {{{ Mark All Alerts as Read
export async function markAllAlertsAsRead(userId: string): Promise<number> {
	const result = await db
		.update(alerts)
		.set({ isRead: true })
		.where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)))
		.returning();

	return result.length;
}
// }}}

// {{{ Delete Alert
export async function deleteAlert(
	alertId: string,
	userId: string
): Promise<boolean> {
	const result = await db
		.delete(alerts)
		.where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
		.returning();

	return result.length > 0;
}
// }}}

// {{{ Create Close Approach Alert
export async function createCloseApproachAlert(
	userId: string,
	asteroidId: string,
	asteroidName: string,
	approachDate: string,
	distanceKm: number
): Promise<Alert> {
	const formattedDistance =
		distanceKm < 1000000
			? `${(distanceKm / 1000).toFixed(0)} thousand km`
			: `${(distanceKm / 1000000).toFixed(2)} million km`;

	return createAlert({
		userId,
		asteroidId,
		type: "close_approach" as AlertType,
		title: `Close Approach: ${asteroidName}`,
		message: `${asteroidName} will pass within ${formattedDistance} of Earth on ${approachDate}.`,
		isRead: false,
	});
}
// }}}

// {{{ Alert Service Export
export const alertService = {
	createAlert,
	getUserAlerts,
	getUnreadAlertCount,
	markAlertAsRead,
	markAllAlertsAsRead,
	deleteAlert,
	createCloseApproachAlert,
};
// }}}

export default alertService;
