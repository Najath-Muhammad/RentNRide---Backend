import type { Types } from "mongoose";
import { ConversationModel } from "../../model/conversation.model";
import type { IConversation } from "../../types/chat/chat.types";
import type { IConversationRepo } from "../interfaces/chat.interface";
import { BaseRepo } from "./base.repository";

export class ConversationRepo
	extends BaseRepo<IConversation>
	implements IConversationRepo
{
	constructor() {
		super(ConversationModel);
	}

	async findByParticipants(
		userAId: string | Types.ObjectId,
		userBId: string | Types.ObjectId,
		vehicleId?: string | Types.ObjectId,
	): Promise<IConversation | null> {
		const filter: Record<string, unknown> = {
			participants: { $all: [userAId, userBId], $size: 2 },
		};
		if (vehicleId) {
			filter.vehicleId = vehicleId;
		}
		return await this.model.findOne(filter).exec();
	}

	async findConversationsByUser(
		userId: string | Types.ObjectId,
	): Promise<IConversation[]> {
		return await this.model
			.find({ participants: userId })
			.populate("participants", "name email profileImage")
			.populate("vehicleId", "brand modelName vehicleImages")
			.populate("lastMessage")
			.sort({ lastMessageAt: -1 })
			.exec();
	}

	async updateLastMessage(
		conversationId: string | Types.ObjectId,
		messageId: string | Types.ObjectId,
	): Promise<IConversation | null> {
		return await this.model
			.findByIdAndUpdate(
				conversationId,
				{
					$set: {
						lastMessage: messageId,
						lastMessageAt: new Date(),
					},
				},
				{ new: true },
			)
			.exec();
	}
}
