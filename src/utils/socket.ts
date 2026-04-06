import type { Server as HttpServer } from "node:http";
import type { Server as SocketServer } from "socket.io";
import { Server } from "socket.io";
import { env } from "../config/env";
import { UserModel } from "../model/user.model";
import { ConversationRepo } from "../repositories/Implementation/conversation.repository";
import { MessageRepo } from "../repositories/Implementation/message.repository";
import { ChatService } from "../services/Implementation/chat.service";
import { verifyToken } from "../utils/jwt-service.utils";
import { sendPushNotification } from "./fcm.util";

let io: SocketServer;

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map<string, Set<string>>();

export function initSocket(server: HttpServer): SocketServer {
	io = new Server(server, {
		cors: {
			origin: "http://localhost:3000",
			credentials: true,
		},
	});

	// Set up chat service
	const messageRepo = new MessageRepo();
	const conversationRepo = new ConversationRepo();
	const chatService = new ChatService(messageRepo, conversationRepo);

	// Authentication middleware
	io.use((socket, next) => {
		try {
			const token =
				socket.handshake.auth.token ||
				socket.handshake.headers.authorization?.replace("Bearer ", "");

			// Also try from cookie
			const cookieHeader = socket.handshake.headers.cookie || "";
			const cookieToken = cookieHeader
				.split(";")
				.find((c) => c.trim().startsWith("accessToken="))
				?.split("=")[1];

			const finalToken = token || cookieToken;

			if (!finalToken) {
				return next(new Error("Authentication token missing"));
			}

			const jwtSecret = env.JWT_SECRET_KEY;
			if (!jwtSecret) {
				return next(new Error("Server configuration error"));
			}

			const decoded = verifyToken(finalToken, jwtSecret) as {
				userId: string;
				email: string;
				role: string;
				name: string;
			};

			if (!decoded) {
				return next(new Error("Invalid token"));
			}

			socket.data.user = decoded;
			next();
		} catch {
			next(new Error("Authentication failed"));
		}
	});

	io.on("connection", (socket) => {
		const userId: string = socket.data.user.userId;
		console.log(`[Socket] User connected: ${userId} (${socket.id})`);

		// Track online users
		if (!onlineUsers.has(userId)) {
			onlineUsers.set(userId, new Set());
		}
		onlineUsers.get(userId)?.add(socket.id);

		// Join personal room to receive direct messages
		socket.join(`user:${userId}`);

		// Broadcast online status
		socket.broadcast.emit("user:online", { userId });

		// ─── Room: join a conversation ─────────────────────────────
		socket.join(`user:${userId}`);

		socket.broadcast.emit("user:online", { userId });

		socket.on("conversation:join", (conversationId: string) => {
			socket.join(`conversation:${conversationId}`);
			console.log(`[Socket] ${userId} joined conversation: ${conversationId}`);
		});

		socket.on("conversation:leave", (conversationId: string) => {
			socket.leave(`conversation:${conversationId}`);
		});

		// ─── Send message ──────────────────────────────────────────
		socket.on(
			"message:send",
			async (data: {
				conversationId?: string;
				receiverId: string;
				vehicleId?: string;
				content: string;
				messageType?: "text" | "booking_request" | "booking_action";
				bookingId?: string;
			}) => {
				try {
					const message = await chatService.sendMessage(userId, {
						conversationId: data.conversationId,
						receiverId: data.receiverId,
						vehicleId: data.vehicleId,
						content: data.content,
						messageType: data.messageType || "text",
						bookingId: data.bookingId,
					});

					// Emit to conversation room
					if (data.conversationId) {
						io.to(`conversation:${data.conversationId}`).emit(
							"message:new",
							message,
						);
					}

					// Emit to receiver's personal room
					io.to(`user:${data.receiverId}`).emit("message:new", message);

					socket.emit("message:sent", message);

					// FCM push notification (works even when receiver is in background / offline)
					try {
						const senderUser = await UserModel.findById(userId).select("name");
						const senderName = senderUser?.name ?? "Someone";
						await sendPushNotification(data.receiverId, {
							title: "New Message",
							body: `You have a new message from ${senderName}`,
							data: {
								type: "chat",
								conversationId: message.conversationId?.toString() ?? "",
							},
						});
					} catch (fcmErr) {
						console.error("[FCM] Chat notification failed:", fcmErr);
					}
				} catch (err) {
					socket.emit("error", {
						message:
							err instanceof Error ? err.message : "Failed to send message",
					});
				}
			},
		);

		// ─── Booking action (approve/reject) ───────────────────────
		socket.on(
			"booking:action",
			async (data: {
				conversationId: string;
				bookingId: string;
				action: "approved" | "rejected";
			}) => {
				try {
					const message = await chatService.handleBookingAction(
						userId,
						data.conversationId,
						data.bookingId,
						data.action,
					);

					// Emit to the conversation room
					io.to(`conversation:${data.conversationId}`).emit(
						"message:new",
						message,
					);

					// Also emit directly to the renter
					const conversation = await conversationRepo.findById(
						data.conversationId,
					);
					if (conversation) {
						const renterId = conversation.participants.find(
							(p) => p.toString() !== userId,
						);
						if (renterId) {
							io.to(`user:${renterId.toString()}`).emit("booking:updated", {
								bookingId: data.bookingId,
								action: data.action,
								message,
							});
						}
					}

					socket.emit("booking:action:done", {
						success: true,
						message,
					});
				} catch (err) {
					socket.emit("error", {
						message:
							err instanceof Error
								? err.message
								: "Failed to process booking action",
					});
				}
			},
		);

		// ─── Typing indicators ─────────────────────────────────────
		socket.on(
			"typing:start",
			(data: { conversationId: string; receiverId: string }) => {
				socket.to(`conversation:${data.conversationId}`).emit("typing:start", {
					userId,
					conversationId: data.conversationId,
				});
				io.to(`user:${data.receiverId}`).emit("typing:start", {
					userId,
					conversationId: data.conversationId,
				});
			},
		);

		socket.on(
			"typing:stop",
			(data: { conversationId: string; receiverId: string }) => {
				socket
					.to(`conversation:${data.conversationId}`)
					.emit("typing:stop", { userId, conversationId: data.conversationId });
				io.to(`user:${data.receiverId}`).emit("typing:stop", {
					userId,
					conversationId: data.conversationId,
				});
			},
		);

		// ─── Disconnect ────────────────────────────────────────────
		socket.on("disconnect", () => {
			const userSockets = onlineUsers.get(userId);
			if (userSockets) {
				userSockets.delete(socket.id);
				if (userSockets.size === 0) {
					onlineUsers.delete(userId);
					socket.broadcast.emit("user:offline", { userId });
				}
			}
			console.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
		});
	});

	return io;
}

export function getIO(): SocketServer {
	if (!io) throw new Error("Socket.IO not initialized");
	return io;
}

export function isUserOnline(userId: string): boolean {
	return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
	if (io) {
		io.to(`user:${userId}`).emit(event, data);
	}
}
