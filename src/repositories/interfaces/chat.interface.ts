import type { Types } from "mongoose";
import type { IConversation, IMessage } from "../../types/chat/chat.types";
import type { IBaseRepo } from "./base.interface";

export interface IMessageRepo extends IBaseRepo<IMessage> {
	findMessagesByConversation(
		conversationId: string | Types.ObjectId,
		page?: number,
		limit?: number,
	): Promise<{
		data: IMessage[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;
	markConversationAsRead(
		conversationId: string | Types.ObjectId,
		userId: string | Types.ObjectId,
	): Promise<void>;
}

export interface IConversationRepo extends IBaseRepo<IConversation> {
	findByParticipants(
		userAId: string | Types.ObjectId,
		userBId: string | Types.ObjectId,
		vehicleId?: string | Types.ObjectId,
	): Promise<IConversation | null>;
	findConversationsByUser(
		userId: string | Types.ObjectId,
	): Promise<IConversation[]>;
	updateLastMessage(
		conversationId: string | Types.ObjectId,
		messageId: string | Types.ObjectId,
	): Promise<IConversation | null>;
}
