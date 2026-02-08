/**
 * Chat Routes
 * Real-time chat for asteroid discussions
 */

import { Elysia, t } from "elysia";
import { eq, desc } from "drizzle-orm";
import { authGuard } from "../middleware/auth";
import { db } from "../db";
import { chatMessages, users } from "../db/schema";
import { sendMessageSchema } from "../utils/validators";

// {{{ Chat Routes
export const chatRoutes = new Elysia({ prefix: "/chat" })
	.use(authGuard)

	// {{{ GET /chat/:asteroidId/messages - Get chat messages
	.get(
		"/:asteroidId/messages",
		async ({ params, query, set }) => {
			try {
				const { asteroidId } = params;
				const limit = parseInt(query.limit ?? "50", 10);

				const messages = await db
					.select({
						id: chatMessages.id,
						content: chatMessages.content,
						createdAt: chatMessages.createdAt,
						user: {
							id: users.id,
							name: users.name,
							avatar: users.avatar,
						},
					})
					.from(chatMessages)
					.leftJoin(users, eq(chatMessages.userId, users.id))
					.where(eq(chatMessages.asteroidId, asteroidId))
					.orderBy(desc(chatMessages.createdAt))
					.limit(limit);

				// Reverse to get chronological order
				messages.reverse();

				return {
					success: true,
					data: {
						asteroidId,
						count: messages.length,
						messages,
					},
				};
			} catch (error) {
				console.error("Chat messages error:", error);
				set.status = 500;
				return { success: false, error: "Failed to fetch messages" };
			}
		},
		{
			params: t.Object({
				asteroidId: t.String(),
			}),
			query: t.Object({
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Chat"],
				summary: "Get chat messages for an asteroid",
			},
		}
	)
	// }}}

	// {{{ POST /chat/:asteroidId/messages - Send a message
	.post(
		"/:asteroidId/messages",
		async ({ user, isAuthenticated, params, body, set }) => {
			if (!isAuthenticated || !user) {
				set.status = 401;
				return { success: false, error: "Not authenticated" };
			}

			try {
				const { asteroidId } = params;
				const { content } = body;

				// Sanitize content to prevent XSS
				const sanitizedContent = content
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#039;")
					.trim();

				if (sanitizedContent.length === 0) {
					set.status = 400;
					return { success: false, error: "Message content cannot be empty" };
				}

				const result = await db
					.insert(chatMessages)
					.values({
						asteroidId,
						userId: user.id,
						content: sanitizedContent,
					})
					.returning();

				const message = result[0];

				return {
					success: true,
					data: {
						message: {
							id: message.id,
							content: message.content,
							createdAt: message.createdAt,
							user: {
								id: user.id,
								name: user.name,
							},
						},
					},
				};
			} catch (error) {
				console.error("Send message error:", error);
				set.status = 500;
				return { success: false, error: "Failed to send message" };
			}
		},
		{
			params: t.Object({
				asteroidId: t.String(),
			}),
			body: sendMessageSchema,
			detail: {
				tags: ["Chat"],
				summary: "Send a message in asteroid chat",
			},
		}
	);
// }}}
// }}}

export default chatRoutes;
