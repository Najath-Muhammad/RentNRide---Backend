import type { Types } from "mongoose";
import type {
    IConversation,
    IMessage,
    SendMessageInput,
} from "../../types/chat/chat.types";

export interface IChatService {
    getOrCreateConversation(
        currentUserId: string | Types.ObjectId,
        otherUserId: string | Types.ObjectId,
        vehicleId?: string,
    ): Promise<IConversation>;

    getConversations(
        userId: string | Types.ObjectId,
    ): Promise<IConversation[]>;

    getMessages(
        conversationId: string | Types.ObjectId,
        userId: string | Types.ObjectId,
        page?: number,
        limit?: number,
    ): Promise<{
        data: IMessage[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;

    sendMessage(
        senderId: string | Types.ObjectId,
        input: SendMessageInput,
    ): Promise<IMessage>;

    handleBookingRequest(
        senderId: string | Types.ObjectId,
        receiverId: string | Types.ObjectId,
        bookingId: string | Types.ObjectId,
        vehicleId: string | Types.ObjectId,
        bookingDetails: string,
    ): Promise<IMessage>;

    handleBookingAction(
        ownerId: string | Types.ObjectId,
        conversationId: string | Types.ObjectId,
        bookingId: string | Types.ObjectId,
        action: "approved" | "rejected",
    ): Promise<IMessage>;
}
