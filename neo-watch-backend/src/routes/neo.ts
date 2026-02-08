/**
 * NEO (Near-Earth Object) Routes
 * Handles asteroid data fetching and lookup
 */

import { Elysia, t } from "elysia";
import { fetchNeoFeed, fetchNeoById, browseNeos } from "../services/nasa";
import { enrichNeosWithRisk, enrichNeoWithRisk } from "../services/risk-engine";
import { neoFeedQuerySchema, neoBrowseQuerySchema } from "../utils/validators";

// {{{ NEO Routes
export const neoRoutes = new Elysia({ prefix: "/neo" })

	// {{{ GET /neo/feed - Get today's NEO feed
	.get(
		"/feed",
		async ({ query, set }) => {
			try {
				const { start_date, end_date } = query;

				// Validate date format (YYYY-MM-DD)
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
				if (start_date && !dateRegex.test(start_date)) {
					set.status = 400;
					return {
						success: false,
						error: "Invalid start_date format. Use YYYY-MM-DD",
					};
				}
				if (end_date && !dateRegex.test(end_date)) {
					set.status = 400;
					return {
						success: false,
						error: "Invalid end_date format. Use YYYY-MM-DD",
					};
				}

				// Validate date range (max 7 days)
				if (start_date && end_date) {
					const start = new Date(start_date);
					const end = new Date(end_date);
					
					// Check for invalid dates
					if (isNaN(start.getTime())) {
						set.status = 400;
						return {
							success: false,
							error: "Invalid start_date value",
						};
					}
					if (isNaN(end.getTime())) {
						set.status = 400;
						return {
							success: false,
							error: "Invalid end_date value",
						};
					}
					
					const diffDays = Math.ceil(
						(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
					);

					if (diffDays > 7) {
						set.status = 400;
						return {
							success: false,
							error: "Date range cannot exceed 7 days",
						};
					}
					
					if (diffDays < 0) {
						set.status = 400;
						return {
							success: false,
							error: "end_date must be after start_date",
						};
					}
				}

				const neos = await fetchNeoFeed(start_date, end_date);
				const enrichedNeos = enrichNeosWithRisk(neos);

				// Sort by risk score (highest first)
				enrichedNeos.sort(
					(a, b) => b.riskAssessment.score - a.riskAssessment.score
				);

				return {
					success: true,
					data: {
						count: enrichedNeos.length,
						asteroids: enrichedNeos,
					},
				};
			} catch (error) {
				console.error("NEO feed error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Failed to fetch NEO data from NASA API",
				};
			}
		},
		{
			query: neoFeedQuerySchema,
			detail: {
				tags: ["NEO"],
				summary: "Get Near-Earth Objects feed for a date range",
			},
		}
	)
	// }}}

	// {{{ GET /neo/stats - Get NEO statistics
	.get(
		"/stats",
		async ({ set }) => {
			try {
				const neos = await fetchNeoFeed();
				const enrichedNeos = enrichNeosWithRisk(neos);

				const hazardousCount = enrichedNeos.filter(
					(n) => n.isPotentiallyHazardous
				).length;

				// Find closest approach
				let closestApproach = null;
				let minDistance = Infinity;

				for (const neo of enrichedNeos) {
					if (neo.closeApproachData.length > 0) {
						const distance = neo.closeApproachData[0].missDistance.kilometers;
						if (distance < minDistance) {
							minDistance = distance;
							closestApproach = {
								asteroid: neo,
								distanceKm: distance,
							};
						}
					}
				}

				// Find largest asteroid
				const largestAsteroid = enrichedNeos.reduce((largest, current) => {
					const currentSize = current.estimatedDiameter.maxKm;
					const largestSize = largest?.estimatedDiameter.maxKm ?? 0;
					return currentSize > largestSize ? current : largest;
				}, enrichedNeos[0]);

				// Find fastest asteroid
				const fastestAsteroid = enrichedNeos.reduce((fastest, current) => {
					const currentVelocity =
						current.closeApproachData[0]?.velocity.kmPerSecond ?? 0;
					const fastestVelocity =
						fastest?.closeApproachData[0]?.velocity.kmPerSecond ?? 0;
					return currentVelocity > fastestVelocity ? current : fastest;
				}, enrichedNeos[0]);

				// Risk distribution
				const riskDistribution = {
					CRITICAL: 0,
					HIGH: 0,
					MODERATE: 0,
					LOW: 0,
					MINIMAL: 0,
				};

				for (const neo of enrichedNeos) {
					riskDistribution[neo.riskAssessment.level]++;
				}

				return {
					success: true,
					data: {
						totalCount: enrichedNeos.length,
						hazardousCount,
						closestApproach,
						largestAsteroid,
						fastestAsteroid,
						riskDistribution,
					},
				};
			} catch (error) {
				console.error("NEO stats error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Failed to fetch NEO statistics",
				};
			}
		},
		{
			detail: {
				tags: ["NEO"],
				summary: "Get NEO statistics for today",
			},
		}
	)
	// }}}

	// {{{ GET /neo/browse - Browse all NEOs (paginated)
	.get(
		"/browse",
		async ({ query, set }) => {
			try {
				const page = parseInt(query.page ?? "0", 10);
				const size = Math.min(parseInt(query.size ?? "20", 10), 50); // Max 50 per page

				const result = await browseNeos(page, size);
				const enrichedNeos = enrichNeosWithRisk(result.neos);

				return {
					success: true,
					data: {
						asteroids: enrichedNeos,
						pagination: {
							...result.pagination,
							hasNext: result.pagination.page < result.pagination.totalPages - 1,
							hasPrevious: result.pagination.page > 0,
						},
					},
				};
			} catch (error) {
				console.error("NEO browse error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Failed to browse NEO data",
				};
			}
		},
		{
			query: neoBrowseQuerySchema,
			detail: {
				tags: ["NEO"],
				summary: "Browse all Near-Earth Objects with pagination",
			},
		}
	)
	// }}}

	// {{{ GET /neo/lookup/:asteroidId - Get specific asteroid
	.get(
		"/lookup/:asteroidId",
		async ({ params, set }) => {
			try {
				const { asteroidId } = params;

				const neo = await fetchNeoById(asteroidId);

				if (!neo) {
					set.status = 404;
					return {
						success: false,
						error: "Asteroid not found",
					};
				}

				const enrichedNeo = enrichNeoWithRisk(neo);

				return {
					success: true,
					data: {
						asteroid: enrichedNeo,
					},
				};
			} catch (error) {
				console.error("NEO lookup error:", error);
				set.status = 500;
				return {
					success: false,
					error: "Failed to fetch asteroid data",
				};
			}
		},
		{
			params: t.Object({
				asteroidId: t.String(),
			}),
			detail: {
				tags: ["NEO"],
				summary: "Lookup a specific asteroid by ID",
			},
		}
	);
// }}}
// }}}

export default neoRoutes;
