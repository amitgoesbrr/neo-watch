/**
 * Risk Analysis Engine
 * Calculates risk scores for Near-Earth Objects based on multiple factors
 */

import type { Neo, RiskLevel, RiskAssessment } from "../types/neo";

// {{{ Constants
const RISK_WEIGHTS = {
	hazardous: 40, // 40% weight for potentially hazardous status
	distance: 30, // 30% weight for miss distance
	size: 20, // 20% weight for estimated diameter
	velocity: 10, // 10% weight for relative velocity
};

// Distance thresholds in kilometers
const DISTANCE_THRESHOLDS = {
	critical: 384400, // Less than Moon distance (~384,400 km)
	high: 1000000, // Less than 1 million km
	moderate: 5000000, // Less than 5 million km
	low: 10000000, // Less than 10 million km
	// Above 10 million km is considered minimal risk
};

// Size thresholds in meters
const SIZE_THRESHOLDS = {
	critical: 1000, // > 1 km (extinction-level)
	high: 500, // > 500 m (regional devastation)
	moderate: 140, // > 140 m (city destroyer)
	low: 50, // > 50 m (local damage)
	// Below 50 m typically burns up in atmosphere
};

// Velocity thresholds in km/s
const VELOCITY_THRESHOLDS = {
	critical: 30, // > 30 km/s (extremely fast)
	high: 20, // > 20 km/s
	moderate: 15, // > 15 km/s
	low: 10, // > 10 km/s
};
// }}}

// {{{ Calculate Hazardous Score (0-40)
function calculateHazardousScore(isPotentiallyHazardous: boolean): number {
	return isPotentiallyHazardous ? RISK_WEIGHTS.hazardous : 0;
}
// }}}

// {{{ Calculate Distance Score (0-30)
function calculateDistanceScore(distanceKm: number): number {
	const maxScore = RISK_WEIGHTS.distance;

	if (distanceKm <= DISTANCE_THRESHOLDS.critical) {
		return maxScore; // 30 points
	}
	if (distanceKm <= DISTANCE_THRESHOLDS.high) {
		return maxScore * 0.75; // 22.5 points
	}
	if (distanceKm <= DISTANCE_THRESHOLDS.moderate) {
		return maxScore * 0.5; // 15 points
	}
	if (distanceKm <= DISTANCE_THRESHOLDS.low) {
		return maxScore * 0.25; // 7.5 points
	}

	// Gradually decrease score for distances > 10 million km
	const beyondLow = distanceKm - DISTANCE_THRESHOLDS.low;
	const maxBeyond = 40000000; // 40 million km as reference
	const score = Math.max(0, maxScore * 0.1 * (1 - beyondLow / maxBeyond));

	return score;
}
// }}}

// {{{ Calculate Size Score (0-20)
function calculateSizeScore(diameterM: number): number {
	const maxScore = RISK_WEIGHTS.size;

	if (diameterM >= SIZE_THRESHOLDS.critical) {
		return maxScore; // 20 points
	}
	if (diameterM >= SIZE_THRESHOLDS.high) {
		return maxScore * 0.75; // 15 points
	}
	if (diameterM >= SIZE_THRESHOLDS.moderate) {
		return maxScore * 0.5; // 10 points
	}
	if (diameterM >= SIZE_THRESHOLDS.low) {
		return maxScore * 0.25; // 5 points
	}

	// Small asteroids get minimal score
	return maxScore * (diameterM / SIZE_THRESHOLDS.low) * 0.25;
}
// }}}

// {{{ Calculate Velocity Score (0-10)
function calculateVelocityScore(velocityKmPerSec: number): number {
	const maxScore = RISK_WEIGHTS.velocity;

	if (velocityKmPerSec >= VELOCITY_THRESHOLDS.critical) {
		return maxScore; // 10 points
	}
	if (velocityKmPerSec >= VELOCITY_THRESHOLDS.high) {
		return maxScore * 0.75; // 7.5 points
	}
	if (velocityKmPerSec >= VELOCITY_THRESHOLDS.moderate) {
		return maxScore * 0.5; // 5 points
	}
	if (velocityKmPerSec >= VELOCITY_THRESHOLDS.low) {
		return maxScore * 0.25; // 2.5 points
	}

	// Slower asteroids get proportional score
	return maxScore * (velocityKmPerSec / VELOCITY_THRESHOLDS.low) * 0.25;
}
// }}}

// {{{ Get Risk Level from Score
function getRiskLevel(score: number): RiskLevel {
	if (score >= 81) return "CRITICAL";
	if (score >= 61) return "HIGH";
	if (score >= 41) return "MODERATE";
	if (score >= 21) return "LOW";
	return "MINIMAL";
}
// }}}

// {{{ Calculate Risk Assessment
export function calculateRiskAssessment(neo: Neo): RiskAssessment {
	// Get the closest approach data (first one or most recent)
	const closestApproach = neo.closeApproachData[0];

	// Use average diameter for size calculation
	const avgDiameterM =
		(neo.estimatedDiameter.minM + neo.estimatedDiameter.maxM) / 2;

	// Get miss distance and velocity
	const distanceKm = closestApproach?.missDistance.kilometers ?? Infinity;
	const velocityKmPerSec = closestApproach?.velocity.kmPerSecond ?? 0;

	// Calculate individual scores
	const hazardousScore = calculateHazardousScore(neo.isPotentiallyHazardous);
	const distanceScore = calculateDistanceScore(distanceKm);
	const sizeScore = calculateSizeScore(avgDiameterM);
	const velocityScore = calculateVelocityScore(velocityKmPerSec);

	// Calculate total score
	const totalScore = Math.round(
		hazardousScore + distanceScore + sizeScore + velocityScore
	);

	// Clamp score to 0-100
	const clampedScore = Math.min(100, Math.max(0, totalScore));

	return {
		score: clampedScore,
		level: getRiskLevel(clampedScore),
		factors: {
			hazardousScore: Math.round(hazardousScore * 10) / 10,
			distanceScore: Math.round(distanceScore * 10) / 10,
			sizeScore: Math.round(sizeScore * 10) / 10,
			velocityScore: Math.round(velocityScore * 10) / 10,
		},
	};
}
// }}}

// {{{ Enrich NEO with Risk Data
export function enrichNeoWithRisk(neo: Neo): Neo & { riskAssessment: RiskAssessment } {
	const riskAssessment = calculateRiskAssessment(neo);
	return {
		...neo,
		riskScore: riskAssessment.score,
		riskLevel: riskAssessment.level,
		riskAssessment,
	};
}
// }}}

// {{{ Batch Enrich NEOs
export function enrichNeosWithRisk(
	neos: Neo[]
): (Neo & { riskAssessment: RiskAssessment })[] {
	return neos.map(enrichNeoWithRisk);
}
// }}}

// {{{ Sort NEOs by Risk
export function sortNeosByRisk(
	neos: Neo[],
	order: "asc" | "desc" = "desc"
): (Neo & { riskAssessment: RiskAssessment })[] {
	const enrichedNeos = enrichNeosWithRisk(neos);

	return enrichedNeos.sort((a, b) => {
		const diff = a.riskAssessment.score - b.riskAssessment.score;
		return order === "desc" ? -diff : diff;
	});
}
// }}}

// {{{ Risk Engine Export
export const riskEngine = {
	calculateRiskAssessment,
	enrichNeoWithRisk,
	enrichNeosWithRisk,
	sortNeosByRisk,
	getRiskLevel,
};
// }}}

export default riskEngine;
