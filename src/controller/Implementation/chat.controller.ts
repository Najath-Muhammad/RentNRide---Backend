import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IChatService } from "../../services/interfaces/chat.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	bookingActionSchema,
	initiateChatSchema,
	sendMessageSchema,
} from "../../validations/commonValidation";
import type { IChatController } from "../interfaces/ichat.controller";

type AuthRequest = Request & { user?: { userId: string; role: string } };

export class ChatController implements IChatController {
	constructor(private _chatService: IChatService) {}

	async getOrCreateConversation(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = (req as AuthRequest).user as { userId: string };
			const parsed = initiateChatSchema.safeParse(req.body);
			if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
			const { otherUserId, vehicleId } = parsed.data;

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
			const { userId } = (req as AuthRequest).user as { userId: string };
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
			const { userId } = (req as AuthRequest).user as { userId: string };
			const { conversationId } = req.params;
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 50;

			if (!conversationId) {
				errorResponse(
					res,
					"conversationId is required",
					HttpStatus.BAD_REQUEST,
				);
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
			const { userId } = (req as AuthRequest).user as { userId: string };
			const parsed = sendMessageSchema.safeParse(req.body);
			if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
			const {
				conversationId,
				receiverId,
				vehicleId,
				content,
				messageType,
				bookingId,
			} = parsed.data;

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
			const { userId } = (req as AuthRequest).user as { userId: string };
			const { conversationId } = req.params;
			const parsed = bookingActionSchema.safeParse(req.body);
			if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
			const { bookingId, action } = parsed.data;

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
