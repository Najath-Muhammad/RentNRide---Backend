import type { Types } from "mongoose";
import { MessageModel } from "../../model/message.model";
import type { IMessage } from "../../types/chat/chat.types";
import type { IMessageRepo } from "../interfaces/chat.interface";
import { BaseRepo } from "./base.repository";

export class MessageRepo
    extends BaseRepo<IMessage>
    implements IMessageRepo {
    constructor() {
        super(MessageModel);
    }

    async findMessagesByConversation(
        conversationId: string | Types.ObjectId,
        page: number = 1,
        limit: number = 50,
    ): Promise<{
        data: IMessage[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const messages = await this.model
            .find({ conversationId })
            .populate("senderId", "name email profileImage")
            .populate("receiverId", "name email profileImage")
            .populate("bookingId", "bookingId startDate endDate totalAmount bookingStatus")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const total = await this.model
            .countDocuments({ conversationId })
            .exec();

        return {
            data: messages,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async markConversationAsRead(
        conversationId: string | Types.ObjectId,
        userId: string | Types.ObjectId,
    ): Promise<void> {
        await this.model.updateMany(
            {
                conversationId,
                receiverId: userId,
                isRead: false,
            },
            { $set: { isRead: true } },
        );
    }
}
