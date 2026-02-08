/**
 * User Profile & Watchlist Routes
 */

import { Elysia, t } from "elysia";
import { eq, and } from "drizzle-orm";
import { authGuard } from "../middleware/auth";
import { db } from "../db";
import { watchlist, asteroids } from "../db/schema";
import { updateUserProfile, toUserProfile, findUserById } from "../services/auth";
import { fetchNeoById } from "../services/nasa";
import { enrichNeoWithRisk } from "../services/risk-engine";
import {
	updateProfileSchema,
	addToWatchlistSchema,
	updateWatchlistSchema,
} from "../utils/validators";

// {{{ User Routes
export const userRoutes = new Elysia({ prefix: "/user" })
	.use(authGuard)

	// {{{ GET /user/profile
	.get(
		"/profile",
		async ({ user, isAuthenticated, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			const fullUser = await findUserById(user.id);
			if (!fullUser) {
				set.status = 404;
				return { success: false, error: "User not found" };
			}

			return {
				success: true,
				data: {
					user: toUserProfile(fullUser),
				},
			};
		},
		{
			detail: {
				tags: ["User"],
				summary: "Get user profile",
			},
		}
	)
	// }}}

	// {{{ PUT /user/profile
	.put(
		"/profile",
		async ({ user, isAuthenticated, body, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const updatedUser = await updateUserProfile(user.id, body);

				if (!updatedUser) {
					set.status = 404;
					return { success: false, error: "User not found" };
				}

				return {
					success: true,
					data: {
						user: toUserProfile(updatedUser),
					},
					message: "Profile updated successfully",
				};
			} catch (error) {
				console.error("Profile update error:", error);
				set.status = 500;
				return { success: false, error: "Failed to update profile" };
			}
		},
		{
			body: updateProfileSchema,
			detail: {
				tags: ["User"],
				summary: "Update user profile",
			},
		}
	)
	// }}}

	// {{{ GET /user/watchlist
	.get(
		"/watchlist",
		async ({ user, isAuthenticated, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const items = await db
					.select()
					.from(watchlist)
					.where(eq(watchlist.userId, user.id));

				// Fetch asteroid data for each item
				const watchlistWithData = await Promise.all(
					items.map(async (item) => {
						const neo = await fetchNeoById(item.asteroidId);
						const enrichedNeo = neo ? enrichNeoWithRisk(neo) : null;

						return {
							...item,
							asteroid: enrichedNeo,
						};
					})
				);

				return {
					success: true,
					data: {
						count: watchlistWithData.length,
						items: watchlistWithData,
					},
				};
			} catch (error) {
				console.error("Watchlist fetch error:", error);
				set.status = 500;
				return { success: false, error: "Failed to fetch watchlist" };
			}
		},
		{
			detail: {
				tags: ["User"],
				summary: "Get user's watchlist",
			},
		}
	)
	// }}}

	// {{{ POST /user/watchlist
	.post(
		"/watchlist",
		async ({ user, isAuthenticated, body, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const { asteroidId, nickname, notes, alertEnabled, alertThresholdKm } =
					body;

				// Check watchlist limit (max 50 items per user)
				const currentItems = await db
					.select()
					.from(watchlist)
					.where(eq(watchlist.userId, user.id));
				
				if (currentItems.length >= 50) {
					set.status = 400;
					return { success: false, error: "Watchlist limit reached (max 50 items)" };
				}

				// Verify asteroid exists via NASA API
				const neo = await fetchNeoById(asteroidId);
				if (!neo) {
					set.status = 404;
					return { success: false, error: "Asteroid not found" };
				}

				// Cache asteroid in database
				await db
					.insert(asteroids)
					.values({
						id: neo.id,
						name: neo.name,
						nasaJplUrl: neo.nasaJplUrl,
						absoluteMagnitude: neo.absoluteMagnitude,
						estimatedDiameterMinKm: neo.estimatedDiameter.minKm,
						estimatedDiameterMaxKm: neo.estimatedDiameter.maxKm,
						estimatedDiameterMinM: neo.estimatedDiameter.minM,
						estimatedDiameterMaxM: neo.estimatedDiameter.maxM,
						isPotentiallyHazardous: neo.isPotentiallyHazardous,
						isSentryObject: neo.isSentryObject,
					})
					.onConflictDoUpdate({
						target: asteroids.id,
						set: {
							lastUpdated: new Date(),
						},
					});

				// Check if already in watchlist
				const existing = await db
					.select()
					.from(watchlist)
					.where(
						and(
							eq(watchlist.userId, user.id),
							eq(watchlist.asteroidId, asteroidId)
						)
					)
					.limit(1);

				if (existing.length > 0) {
					set.status = 409;
					return { success: false, error: "Asteroid already in watchlist" };
				}

				// Add to watchlist
				const result = await db
					.insert(watchlist)
					.values({
						userId: user.id,
						asteroidId,
						nickname,
						notes,
						alertEnabled: alertEnabled ?? true,
						alertThresholdKm: alertThresholdKm ?? 7500000,
					})
					.returning();

				return {
					success: true,
					data: {
						item: result[0],
						asteroid: enrichNeoWithRisk(neo),
					},
					message: "Added to watchlist",
				};
			} catch (error) {
				console.error("Watchlist add error:", error);
				set.status = 500;
				return { success: false, error: "Failed to add to watchlist" };
			}
		},
		{
			body: addToWatchlistSchema,
			detail: {
				tags: ["User"],
				summary: "Add asteroid to watchlist",
			},
		}
	)
	// }}}

	// {{{ PUT /user/watchlist/:asteroidId
	.put(
		"/watchlist/:asteroidId",
		async ({ user, isAuthenticated, params, body, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const { asteroidId } = params;

				const result = await db
					.update(watchlist)
					.set(body)
					.where(
						and(
							eq(watchlist.userId, user.id),
							eq(watchlist.asteroidId, asteroidId)
						)
					)
					.returning();

				if (result.length === 0) {
					set.status = 404;
					return { success: false, error: "Watchlist item not found" };
				}

				return {
					success: true,
					data: {
						item: result[0],
					},
					message: "Watchlist item updated",
				};
			} catch (error) {
				console.error("Watchlist update error:", error);
				set.status = 500;
				return { success: false, error: "Failed to update watchlist item" };
			}
		},
		{
			params: t.Object({
				asteroidId: t.String(),
			}),
			body: updateWatchlistSchema,
			detail: {
				tags: ["User"],
				summary: "Update watchlist item",
			},
		}
	)
	// }}}

	// {{{ DELETE /user/watchlist/:asteroidId
	.delete(
		"/watchlist/:asteroidId",
		async ({ user, isAuthenticated, params, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const { asteroidId } = params;

				const result = await db
					.delete(watchlist)
					.where(
						and(
							eq(watchlist.userId, user.id),
							eq(watchlist.asteroidId, asteroidId)
						)
					)
					.returning();

				if (result.length === 0) {
					set.status = 404;
					return { success: false, error: "Watchlist item not found" };
				}

				return {
					success: true,
					message: "Removed from watchlist",
				};
			} catch (error) {
				console.error("Watchlist delete error:", error);
				set.status = 500;
				return { success: false, error: "Failed to remove from watchlist" };
			}
		},
		{
			params: t.Object({
				asteroidId: t.String(),
			}),
			detail: {
				tags: ["User"],
				summary: "Remove asteroid from watchlist",
			},
		}
	);
// }}}
// }}}

export default userRoutes;
