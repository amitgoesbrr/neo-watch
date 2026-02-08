/**
 * WebSocket Routes
 * Real-time chat via Elysia's built-in WebSocket support
 */

import { Elysia, t } from "elysia";
import { eq, desc } from "drizzle-orm";
import { jwt } from "@elysiajs/jwt";
import { env } from "../config/env";
import { db } from "../db";
import { chatMessages, users } from "../db/schema";
import { findUserById } from "../services/auth";
import type { TokenPayload } from "../middleware/auth";

// {{{ Types
interface ChatUser {
	id: string;
	name: string;
	avatar: string | null;
}

interface RoomConnection {
	user: ChatUser;
	ws: any;
}

// Room tracking: asteroidId → connId → { user, ws }
// Multiple connections allowed per user (tabs), but online count shows unique users
const rooms = new Map<string, Map<string, RoomConnection>>();
let connectionCounter = 0;
// }}}

// {{{ Helper: Get or create room
function getRoom(asteroidId: string) {
	if (!rooms.has(asteroidId)) {
		rooms.set(asteroidId, new Map());
	}
	return rooms.get(asteroidId)!;
}
// }}}

// {{{ Helper: Generate unique connection ID
function nextConnectionId(): string {
	return `conn_${++connectionCounter}_${Date.now()}`;
}
// }}}

// {{{ Helper: Count unique users in a room
function uniqueUserCount(room: Map<string, RoomConnection>): number {
	const userIds = new Set<string>();
	for (const [, entry] of room) {
		userIds.add(entry.user.id);
	}
	return userIds.size;
}
// }}}

// {{{ Helper: Check if user has other connections in room
function userHasOtherConnections(room: Map<string, RoomConnection>, userId: string, excludeConnId: string): boolean {
	for (const [connId, entry] of room) {
		if (entry.user.id === userId && connId !== excludeConnId) return true;
	}
	return false;
}
// }}}

// {{{ Helper: Broadcast to room (exclude by userId for typing, by connId for join)
function broadcastToRoom(asteroidId: string, data: object, excludeUserId?: string) {
	const room = rooms.get(asteroidId);
	if (!room) return;

	const payload = JSON.stringify(data);
	for (const [, entry] of room) {
		if (entry.user.id !== excludeUserId) {
			try {
				entry.ws.send(payload);
			} catch {
				// Connection dead, will be cleaned up on close
			}
		}
	}
}
// }}}

// {{{ Helper: Broadcast to all in room (including sender)
function broadcastToAll(asteroidId: string, data: object) {
	const room = rooms.get(asteroidId);
	if (!room) return;

	const payload = JSON.stringify(data);
	for (const [, entry] of room) {
		try {
			entry.ws.send(payload);
		} catch {
			// Connection dead
		}
	}
}
// }}}

// {{{ WebSocket Routes
export const wsRoutes = new Elysia({ prefix: "/ws" })
	.use(
		jwt({
			name: "jwt",
			secret: env.JWT_SECRET,
		})
	)
	.ws("/chat/:asteroidId", {
		params: t.Object({
			asteroidId: t.String(),
		}),
		query: t.Object({
			token: t.Optional(t.String()),
		}),

		async open(ws) {
			const { asteroidId } = ws.data.params;
			const token = ws.data.query.token;

			if (!token) {
				ws.send(JSON.stringify({ type: "error", message: "Authentication required" }));
				ws.close();
				return;
			}

			try {
				const payload = await ws.data.jwt.verify(token) as TokenPayload | false;
				if (!payload) {
					ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
					ws.close();
					return;
				}

				const dbUser = await findUserById(payload.userId);
				if (!dbUser) {
					ws.send(JSON.stringify({ type: "error", message: "User not found" }));
					ws.close();
					return;
				}

				const user: ChatUser = {
					id: dbUser.id,
					name: dbUser.name,
					avatar: dbUser.avatar,
				};

				// Store user data on ws context
				(ws.data as any)._user = user;

				const connId = nextConnectionId();
				(ws.data as any)._connId = connId;

				const room = getRoom(asteroidId);
				const wasAlreadyInRoom = userHasOtherConnections(room, user.id, connId);

				// Add this connection
				room.set(connId, { user, ws });

				const online = uniqueUserCount(room);

				// Only broadcast user_joined if this is a genuinely new user (not another tab)
				if (!wasAlreadyInRoom) {
					broadcastToRoom(
						asteroidId,
						{
							type: "user_joined",
							user: { id: user.id, name: user.name },
							onlineCount: online,
							timestamp: new Date().toISOString(),
						},
						user.id
					);
				}

				// Send confirmation to the connecting user
				ws.send(
					JSON.stringify({
						type: "connected",
						asteroidId,
						user: { id: user.id, name: user.name },
						onlineCount: online,
					})
				);

				console.log(`[WS] ${user.name} joined chat for asteroid ${asteroidId} (${online} unique users, ${room.size} connections)`);
			} catch (err) {
				console.error("[WS] Auth error:", err);
				ws.send(JSON.stringify({ type: "error", message: "Authentication failed" }));
				ws.close();
			}
		},

		async message(ws, rawMessage) {
			const { asteroidId } = ws.data.params;
			const user = (ws.data as any)._user as ChatUser | undefined;

			if (!user) {
				ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
				return;
			}


			try {
				// rawMessage could be a string or already parsed by Elysia — handle both
				const parsed = typeof rawMessage === "string"
					? JSON.parse(rawMessage)
					: rawMessage;

				switch (parsed.type) {
					case "message": {
						const content = parsed.content?.trim();
						if (!content || content.length === 0 || content.length > 2000) {
							ws.send(
								JSON.stringify({
									type: "error",
									message: "Message must be 1-2000 characters",
								})
							);
							return;
						}

						// Sanitize content
						const sanitizedContent = content
							.replace(/&/g, "&amp;")
							.replace(/</g, "&lt;")
							.replace(/>/g, "&gt;")
							.replace(/"/g, "&quot;")
							.replace(/'/g, "&#039;");

						// Save to database
						const result = await db
							.insert(chatMessages)
							.values({
								asteroidId,
								userId: user.id,
								content: sanitizedContent,
							})
							.returning();

						const savedMessage = result[0];

						// Broadcast to ALL in room (including sender for confirmation)
						broadcastToAll(asteroidId, {
							type: "message",
							message: {
								id: savedMessage.id,
								content: savedMessage.content,
								createdAt: savedMessage.createdAt.toISOString(),
								user: {
									id: user.id,
									name: user.name,
									avatar: user.avatar,
								},
							},
						});
						break;
					}

					case "typing": {
						// Broadcast typing indicator to others (exclude sender by userId)
						broadcastToRoom(
							asteroidId,
							{
								type: "typing",
								user: { id: user.id, name: user.name },
							},
							user.id
						);
						break;
					}

					case "stop_typing": {
						broadcastToRoom(
							asteroidId,
							{
								type: "stop_typing",
								user: { id: user.id, name: user.name },
							},
							user.id
						);
						break;
					}

					default:
						ws.send(
							JSON.stringify({
								type: "error",
								message: `Unknown message type: ${parsed.type}`,
							})
						);
				}
			} catch (err) {
				console.error("[WS] Message handling error:", err);
				ws.send(
					JSON.stringify({
						type: "error",
						message: "Failed to process message.",
					})
				);
			}
		},

		close(ws) {
			const { asteroidId } = ws.data.params;
			const user = (ws.data as any)._user as ChatUser | undefined;
			const connId = (ws.data as any)._connId as string | undefined;

			if (!user || !connId) return;

			const room = rooms.get(asteroidId);
			if (room) {
				room.delete(connId);

				// Only broadcast user_left if the user has NO remaining connections
				const stillConnected = userHasOtherConnections(room, user.id, connId);
				if (!stillConnected) {
					const online = uniqueUserCount(room);
					broadcastToRoom(asteroidId, {
						type: "user_left",
						user: { id: user.id, name: user.name },
						onlineCount: online,
						timestamp: new Date().toISOString(),
					});
				}

				console.log(`[WS] ${user.name} disconnected from asteroid ${asteroidId} (${uniqueUserCount(room)} unique users, ${room.size} connections)`);

				if (room.size === 0) {
					rooms.delete(asteroidId);
				}
			}
		},
	});
// }}}

export default wsRoutes;
