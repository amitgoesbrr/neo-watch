/**
 * Asteroids Schema
 * Caches asteroid data from NASA API for faster access
 */

import {
	pgTable,
	varchar,
	text,
	doublePrecision,
	boolean,
	timestamp,
	jsonb,
} from "drizzle-orm/pg-core";

// {{{ Close Approach Data Type
export interface CloseApproachData {
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
// }}}

// {{{ Orbital Data Type
export interface OrbitalData {
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
	orbit_class: {
		orbit_class_type: string;
		orbit_class_description: string;
		orbit_class_range: string;
	};
}
// }}}

// {{{ Asteroids Table
export const asteroids = pgTable("asteroids", {
	id: varchar("id", { length: 50 }).primaryKey(), // NASA neo_reference_id
	name: varchar("name", { length: 255 }).notNull(),
	nasaJplUrl: text("nasa_jpl_url"),
	absoluteMagnitude: doublePrecision("absolute_magnitude"),
	estimatedDiameterMinKm: doublePrecision("estimated_diameter_min_km"),
	estimatedDiameterMaxKm: doublePrecision("estimated_diameter_max_km"),
	estimatedDiameterMinM: doublePrecision("estimated_diameter_min_m"),
	estimatedDiameterMaxM: doublePrecision("estimated_diameter_max_m"),
	isPotentiallyHazardous: boolean("is_potentially_hazardous").notNull(),
	isSentryObject: boolean("is_sentry_object").default(false),
	closeApproachData: jsonb("close_approach_data").$type<CloseApproachData[]>(),
	orbitalData: jsonb("orbital_data").$type<OrbitalData>(),
	lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
// }}}

// {{{ Type Exports
export type Asteroid = typeof asteroids.$inferSelect;
export type NewAsteroid = typeof asteroids.$inferInsert;
// }}}
