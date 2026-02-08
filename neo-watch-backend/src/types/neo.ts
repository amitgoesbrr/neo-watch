/**
 * NEO Type Definitions
 * Types for NASA NeoWs API responses
 */

// {{{ NASA API Response Types
export interface NasaNeoResponse {
	links: {
		next?: string;
		previous?: string;
		self: string;
	};
	element_count: number;
	near_earth_objects: {
		[date: string]: NasaNeo[];
	};
}

export interface NasaNeoBrowseResponse {
	links: {
		next?: string;
		self: string;
	};
	page: {
		size: number;
		total_elements: number;
		total_pages: number;
		number: number;
	};
	near_earth_objects: NasaNeo[];
}

export interface NasaNeo {
	links: {
		self: string;
	};
	id: string;
	neo_reference_id: string;
	name: string;
	nasa_jpl_url: string;
	absolute_magnitude_h: number;
	estimated_diameter: {
		kilometers: {
			estimated_diameter_min: number;
			estimated_diameter_max: number;
		};
		meters: {
			estimated_diameter_min: number;
			estimated_diameter_max: number;
		};
		miles: {
			estimated_diameter_min: number;
			estimated_diameter_max: number;
		};
		feet: {
			estimated_diameter_min: number;
			estimated_diameter_max: number;
		};
	};
	is_potentially_hazardous_asteroid: boolean;
	close_approach_data: NasaCloseApproach[];
	is_sentry_object: boolean;
	orbital_data?: NasaOrbitalData;
}

export interface NasaCloseApproach {
	close_approach_date: string;
	close_approach_date_full: string;
	epoch_date_close_approach: number;
	relative_velocity: {
		kilometers_per_second: string;
		kilometers_per_hour: string;
		miles_per_hour: string;
	};
	miss_distance: {
		astronomical: string;
		lunar: string;
		kilometers: string;
		miles: string;
	};
	orbiting_body: string;
}

export interface NasaOrbitalData {
	orbit_id: string;
	orbit_determination_date: string;
	first_observation_date: string;
	last_observation_date: string;
	data_arc_in_days: number;
	observations_used: number;
	orbit_uncertainty: string;
	minimum_orbit_intersection: string;
	jupiter_tisserand_invariant: string;
	epoch_osculation: string;
	eccentricity: string;
	semi_major_axis: string;
	inclination: string;
	ascending_node_longitude: string;
	orbital_period: string;
	perihelion_distance: string;
	perihelion_argument: string;
	aphelion_distance: string;
	perihelion_time: string;
	mean_anomaly: string;
	mean_motion: string;
	equinox: string;
	orbit_class?: {
		orbit_class_type: string;
		orbit_class_description: string;
		orbit_class_range: string;
	};
}
// }}}

// {{{ App NEO Types (Transformed)
export interface Neo {
	id: string;
	name: string;
	nasaJplUrl: string;
	absoluteMagnitude: number;
	estimatedDiameter: {
		minKm: number;
		maxKm: number;
		minM: number;
		maxM: number;
	};
	isPotentiallyHazardous: boolean;
	isSentryObject: boolean;
	closeApproachData: CloseApproach[];
	riskScore?: number;
	riskLevel?: RiskLevel;
}

export interface CloseApproach {
	date: string;
	dateFull: string;
	epochDate: number;
	velocity: {
		kmPerSecond: number;
		kmPerHour: number;
	};
	missDistance: {
		astronomical: number;
		lunar: number;
		kilometers: number;
	};
	orbitingBody: string;
}
// }}}

// {{{ Risk Types
export type RiskLevel = "MINIMAL" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface RiskAssessment {
	score: number; // 0-100
	level: RiskLevel;
	factors: {
		hazardousScore: number;
		distanceScore: number;
		sizeScore: number;
		velocityScore: number;
	};
}
// }}}

// {{{ Stats Types
export interface NeoStats {
	totalCount: number;
	hazardousCount: number;
	closestApproach: {
		asteroid: Neo;
		distanceKm: number;
	} | null;
	largestAsteroid: Neo | null;
	fastestAsteroid: Neo | null;
}
// }}}
