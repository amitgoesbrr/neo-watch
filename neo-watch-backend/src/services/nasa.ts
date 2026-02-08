/**
 * NASA API Service
 * Handles all interactions with NASA's NeoWs API
 */

import { env } from "../config/env";
import type {
	NasaNeoResponse,
	NasaNeoBrowseResponse,
	NasaNeo,
	Neo,
	CloseApproach,
} from "../types/neo";

// {{{ Constants
const API_BASE_URL = env.NASA_API_BASE_URL;
const API_KEY = env.NASA_API_KEY;
// }}}

// {{{ Transform NASA NEO to App NEO
export function transformNasaNeo(nasaNeo: NasaNeo): Neo {
	return {
		id: nasaNeo.neo_reference_id,
		name: nasaNeo.name,
		nasaJplUrl: nasaNeo.nasa_jpl_url,
		absoluteMagnitude: nasaNeo.absolute_magnitude_h,
		estimatedDiameter: {
			minKm: nasaNeo.estimated_diameter.kilometers.estimated_diameter_min,
			maxKm: nasaNeo.estimated_diameter.kilometers.estimated_diameter_max,
			minM: nasaNeo.estimated_diameter.meters.estimated_diameter_min,
			maxM: nasaNeo.estimated_diameter.meters.estimated_diameter_max,
		},
		isPotentiallyHazardous: nasaNeo.is_potentially_hazardous_asteroid,
		isSentryObject: nasaNeo.is_sentry_object,
		closeApproachData: nasaNeo.close_approach_data.map(
			(approach): CloseApproach => ({
				date: approach.close_approach_date,
				dateFull: approach.close_approach_date_full,
				epochDate: approach.epoch_date_close_approach,
				velocity: {
					kmPerSecond: parseFloat(approach.relative_velocity.kilometers_per_second),
					kmPerHour: parseFloat(approach.relative_velocity.kilometers_per_hour),
				},
				missDistance: {
					astronomical: parseFloat(approach.miss_distance.astronomical),
					lunar: parseFloat(approach.miss_distance.lunar),
					kilometers: parseFloat(approach.miss_distance.kilometers),
				},
				orbitingBody: approach.orbiting_body,
			})
		),
	};
}
// }}}

// {{{ Get Today's Date in YYYY-MM-DD Format
function getTodayDate(): string {
	const today = new Date();
	return today.toISOString().split("T")[0];
}
// }}}

// {{{ Fetch NEO Feed
export async function fetchNeoFeed(
	startDate?: string,
	endDate?: string
): Promise<Neo[]> {
	const start = startDate || getTodayDate();
	const end = endDate || start;

	const url = `${API_BASE_URL}/feed?start_date=${start}&end_date=${end}&api_key=${API_KEY}`;

	const response = await fetch(url);

	if (response.status === 429) {
		throw new Error("NASA API rate limit exceeded. Please try again later.");
	}

	if (!response.ok) {
		throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
	}

	const data: NasaNeoResponse = await response.json();

	// Flatten all NEOs from all dates
	const allNeos: Neo[] = [];
	for (const date of Object.keys(data.near_earth_objects)) {
		const neos = data.near_earth_objects[date].map(transformNasaNeo);
		allNeos.push(...neos);
	}

	return allNeos;
}
// }}}

// {{{ Fetch NEO by ID (Lookup)
export async function fetchNeoById(asteroidId: string): Promise<Neo | null> {
	const url = `${API_BASE_URL}/neo/${asteroidId}?api_key=${API_KEY}`;

	const response = await fetch(url);

	if (response.status === 404) {
		return null;
	}

	if (response.status === 429) {
		throw new Error("NASA API rate limit exceeded. Please try again later.");
	}

	if (!response.ok) {
		throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
	}

	const data: NasaNeo = await response.json();
	return transformNasaNeo(data);
}
// }}}

// {{{ Browse All NEOs (Paginated)
export async function browseNeos(
	page: number = 0,
	size: number = 20
): Promise<{
	neos: Neo[];
	pagination: {
		page: number;
		size: number;
		totalElements: number;
		totalPages: number;
	};
}> {
	const url = `${API_BASE_URL}/neo/browse?page=${page}&size=${size}&api_key=${API_KEY}`;

	const response = await fetch(url);

	if (response.status === 429) {
		throw new Error("NASA API rate limit exceeded. Please try again later.");
	}

	if (!response.ok) {
		throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
	}

	const data: NasaNeoBrowseResponse = await response.json();

	return {
		neos: data.near_earth_objects.map(transformNasaNeo),
		pagination: {
			page: data.page.number,
			size: data.page.size,
			totalElements: data.page.total_elements,
			totalPages: data.page.total_pages,
		},
	};
}
// }}}

// {{{ NASA Service Export
export const nasaService = {
	fetchNeoFeed,
	fetchNeoById,
	browseNeos,
	transformNasaNeo,
};
// }}}

export default nasaService;
