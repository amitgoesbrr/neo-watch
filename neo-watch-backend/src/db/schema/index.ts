/**
 * Database Schema Barrel Export
 * Exports all schemas and types from a single location
 */

// Tables
export { users, type User, type NewUser } from "./users";

export {
	asteroids,
	type Asteroid,
	type NewAsteroid,
	type CloseApproachData,
	type OrbitalData,
} from "./asteroids";

export {
	watchlist,
	type WatchlistItem,
	type NewWatchlistItem,
} from "./watchlist";

export {
	alerts,
	type Alert,
	type NewAlert,
	type AlertType,
} from "./alerts";

export {
	chatMessages,
	type ChatMessage,
	type NewChatMessage,
} from "./messages";
