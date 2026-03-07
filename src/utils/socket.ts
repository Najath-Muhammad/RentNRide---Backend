import type { Server as HttpServer } from "http";
import type { Server as SocketServer } from "socket.io";
import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt-service.utils";
import { ConversationRepo } from "../repositories/Implementation/conversation.repository";
import { MessageRepo } from "../repositories/Implementation/message.repository";
import { ChatService } from "../services/Implementation/chat.service";

let io: SocketServer;

<<<<<<< HEAD
// Track online users: userId -> Set of socketIds
=======
>>>>>>> feat/chat
const onlineUsers = new Map<string, Set<string>>();

export function initSocket(server: HttpServer): SocketServer {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });

<<<<<<< HEAD
    // Set up chat service
=======
>>>>>>> feat/chat
    const messageRepo = new MessageRepo();
    const conversationRepo = new ConversationRepo();
    const chatService = new ChatService(messageRepo, conversationRepo);

<<<<<<< HEAD
    // Authentication middleware
=======
>>>>>>> feat/chat
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth.token ||
                socket.handshake.headers.authorization?.replace("Bearer ", "");

<<<<<<< HEAD
            // Also try from cookie
=======
>>>>>>> feat/chat
            const cookieHeader = socket.handshake.headers.cookie || "";
            const cookieToken = cookieHeader
                .split(";")
                .find((c) => c.trim().startsWith("accessToken="))
                ?.split("=")[1];

            const finalToken = token || cookieToken;

            if (!finalToken) {
                return next(new Error("Authentication token missing"));
            }

            const jwtSecret = process.env.JWT_SECRET_KEY;
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

<<<<<<< HEAD
        // Track online users
=======
>>>>>>> feat/chat
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)!.add(socket.id);

<<<<<<< HEAD
        // Join personal room to receive direct messages
        socket.join(`user:${userId}`);

        // Broadcast online status
        socket.broadcast.emit("user:online", { userId });

        // ─── Room: join a conversation ─────────────────────────────
=======
        socket.join(`user:${userId}`);

        socket.broadcast.emit("user:online", { userId });

>>>>>>> feat/chat
        socket.on("conversation:join", (conversationId: string) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`[Socket] ${userId} joined conversation: ${conversationId}`);
        });

        socket.on("conversation:leave", (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`);
        });

<<<<<<< HEAD
        // ─── Send message ──────────────────────────────────────────
=======
>>>>>>> feat/chat
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

<<<<<<< HEAD
                    // Emit to conversation room
=======
>>>>>>> feat/chat
                    if (data.conversationId) {
                        io.to(`conversation:${data.conversationId}`).emit(
                            "message:new",
                            message,
                        );
                    }

<<<<<<< HEAD
                    // Always emit to receiver's personal room
                    io.to(`user:${data.receiverId}`).emit("message:new", message);

                    // Confirm to sender
=======
                    io.to(`user:${data.receiverId}`).emit("message:new", message);

>>>>>>> feat/chat
                    socket.emit("message:sent", message);
                } catch (err) {
                    socket.emit("error", {
                        message:
                            err instanceof Error ? err.message : "Failed to send message",
                    });
                }
            },
        );

<<<<<<< HEAD
        // ─── Booking action (approve/reject) ───────────────────────
=======
>>>>>>> feat/chat
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

<<<<<<< HEAD
                    // Emit to the conversation room
=======
>>>>>>> feat/chat
                    io.to(`conversation:${data.conversationId}`).emit(
                        "message:new",
                        message,
                    );
<<<<<<< HEAD

                    // Also emit directly to the renter
=======
>>>>>>> feat/chat
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

<<<<<<< HEAD
        // ─── Typing indicators ─────────────────────────────────────
=======
>>>>>>> feat/chat
        socket.on(
            "typing:start",
            (data: { conversationId: string; receiverId: string }) => {
                socket
                    .to(`conversation:${data.conversationId}`)
                    .emit("typing:start", { userId, conversationId: data.conversationId });
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

<<<<<<< HEAD
        // ─── Disconnect ────────────────────────────────────────────
=======
>>>>>>> feat/chat
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
