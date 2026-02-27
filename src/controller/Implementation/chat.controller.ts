import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IChatService } from "../../services/Interfaces/chat.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IChatController } from "../interfaces/ichat.controller";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class ChatController implements IChatController {
    constructor(private _chatService: IChatService) { }

    async getOrCreateConversation(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = (req as AuthRequest).user!;
            const { otherUserId, vehicleId } = req.body;

            if (!otherUserId) {
                errorResponse(res, "otherUserId is required", HttpStatus.BAD_REQUEST);
                return;
            }

            const conversation = await this._chatService.getOrCreateConversation(
                userId,
                otherUserId,
                vehicleId,
            );

            successResponse(res, "Conversation retrieved", conversation);
        } catch (error) {
            console.error("Error in getOrCreateConversation controller:", error);
            errorResponse(
                res,
                error instanceof Error ? error.message : "Internal server error",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getConversations(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = (req as AuthRequest).user!;
            const conversations = await this._chatService.getConversations(userId);
            successResponse(res, "Conversations fetched", conversations);
        } catch (error) {
            console.error("Error in getConversations controller:", error);
            errorResponse(
                res,
                error instanceof Error ? error.message : "Internal server error",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = (req as AuthRequest).user!;
            const { conversationId } = req.params;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 50;

            if (!conversationId) {
                errorResponse(res, "conversationId is required", HttpStatus.BAD_REQUEST);
                return;
            }

            const result = await this._chatService.getMessages(
                conversationId,
                userId,
                page,
                limit,
            );

            successResponse(res, "Messages fetched", result);
        } catch (error) {
            console.error("Error in getMessages controller:", error);
            errorResponse(
                res,
                error instanceof Error ? error.message : "Internal server error",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = (req as AuthRequest).user!;
            const { conversationId, receiverId, vehicleId, content, messageType, bookingId } =
                req.body;

            if (!receiverId || !content) {
                errorResponse(
                    res,
                    "receiverId and content are required",
                    HttpStatus.BAD_REQUEST,
                );
                return;
            }

            const message = await this._chatService.sendMessage(userId, {
                conversationId,
                receiverId,
                vehicleId,
                content,
                messageType,
                bookingId,
            });

            successResponse(res, "Message sent", message, HttpStatus.CREATED);
        } catch (error) {
            console.error("Error in sendMessage controller:", error);
            errorResponse(
                res,
                error instanceof Error ? error.message : "Internal server error",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async handleBookingAction(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = (req as AuthRequest).user!;
            const { conversationId } = req.params;
            const { bookingId, action } = req.body;

            if (!bookingId || !action) {
                errorResponse(
                    res,
                    "bookingId and action are required",
                    HttpStatus.BAD_REQUEST,
                );
                return;
            }

            if (action !== "approved" && action !== "rejected") {
                errorResponse(
                    res,
                    "action must be 'approved' or 'rejected'",
                    HttpStatus.BAD_REQUEST,
                );
                return;
            }

            const message = await this._chatService.handleBookingAction(
                userId,
                conversationId,
                bookingId,
                action,
            );

            successResponse(res, `Booking ${action} successfully`, message);
        } catch (error) {
            console.error("Error in handleBookingAction controller:", error);
            errorResponse(
                res,
                error instanceof Error ? error.message : "Internal server error",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
