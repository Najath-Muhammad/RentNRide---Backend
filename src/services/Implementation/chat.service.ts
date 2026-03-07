import { Types } from "mongoose";
import { MessageModel } from "../../model/message.model";
<<<<<<< HEAD
import type { IConversationRepo, IMessageRepo,} from "../../repositories/interfaces/chat.interface";
=======
import { BookingModel } from "../../model/booking.model";
import type { IConversationRepo, IMessageRepo, } from "../../repositories/interfaces/chat.interface";
>>>>>>> feat/chat
import type {
    IConversation,
    IMessage,
    SendMessageInput,
} from "../../types/chat/chat.types";
import type { IChatService } from "../Interfaces/chat.interface.service";

export class ChatService implements IChatService {
    constructor(
        private _messageRepo: IMessageRepo,
        private _conversationRepo: IConversationRepo,
    ) { }

    private async populateMessage(messageId: Types.ObjectId): Promise<IMessage | null> {
        return await MessageModel
            .findById(messageId)
            .populate("senderId", "name email profileImage")
            .populate("receiverId", "name email profileImage")
            .populate("bookingId", "bookingId startDate endDate totalAmount bookingStatus")
            .exec() as IMessage | null;
    }

    async getOrCreateConversation(
        currentUserId: string | Types.ObjectId,
        otherUserId: string | Types.ObjectId,
        vehicleId?: string,
    ): Promise<IConversation> {
        try {
            const existing = await this._conversationRepo.findByParticipants(
                currentUserId,
                otherUserId,
                vehicleId,
            );

            if (existing) return existing;

            const data: Partial<IConversation> = {
                participants: [
                    typeof currentUserId === "string"
                        ? new Types.ObjectId(currentUserId)
                        : currentUserId,
                    typeof otherUserId === "string"
                        ? new Types.ObjectId(otherUserId)
                        : otherUserId,
                ],
            };

            if (vehicleId) {
                data.vehicleId = new Types.ObjectId(vehicleId);
            }

            return await this._conversationRepo.create(data);
        } catch (error) {
            console.error("Error in getOrCreateConversation:", error);
            throw error;
        }
    }

    async getConversations(
        userId: string | Types.ObjectId,
    ): Promise<IConversation[]> {
        try {
            return await this._conversationRepo.findConversationsByUser(userId);
        } catch (error) {
            console.error("Error in getConversations:", error);
            throw error;
        }
    }

    async getMessages(
        conversationId: string | Types.ObjectId,
        userId: string | Types.ObjectId,
        page: number = 1,
        limit: number = 50,
    ): Promise<{
        data: IMessage[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        try {
            await this._messageRepo.markConversationAsRead(conversationId, userId);
            return await this._messageRepo.findMessagesByConversation(
                conversationId,
                page,
                limit,
            );
        } catch (error) {
            console.error("Error in getMessages:", error);
            throw error;
        }
    }

    async sendMessage(
        senderId: string | Types.ObjectId,
        input: SendMessageInput,
    ): Promise<IMessage> {
        try {
            const {
                conversationId,
                receiverId,
                vehicleId,
                content,
                messageType = "text",
                bookingId,
            } = input;

            let convId: Types.ObjectId;

            if (conversationId) {
                convId = new Types.ObjectId(conversationId);
            } else {
                const conversation = await this.getOrCreateConversation(
                    senderId,
                    receiverId,
                    vehicleId,
                );
                convId = conversation._id;
            }

            const senderObjId =
                typeof senderId === "string" ? new Types.ObjectId(senderId) : senderId;
            const receiverObjId = new Types.ObjectId(receiverId);

            const messageData: Partial<IMessage> = {
                conversationId: convId,
                senderId: senderObjId,
                receiverId: receiverObjId,
                content,
                messageType,
                isRead: false,
            };

            if (bookingId) {
                messageData.bookingId = new Types.ObjectId(bookingId);
            }

            const message = await this._messageRepo.create(messageData);
            await this._conversationRepo.updateLastMessage(convId, message._id);

            const populated = await this.populateMessage(message._id);
            return populated ?? message;
        } catch (error) {
            console.error("Error in sendMessage:", error);
            throw error;
        }
    }

    async handleBookingRequest(
        senderId: string | Types.ObjectId,
        receiverId: string | Types.ObjectId,
        bookingId: string | Types.ObjectId,
        vehicleId: string | Types.ObjectId,
        bookingDetails: string,
    ): Promise<IMessage> {
        try {
            const conversation = await this.getOrCreateConversation(
                senderId,
                receiverId,
                vehicleId.toString(),
            );

            const senderObjId =
                typeof senderId === "string" ? new Types.ObjectId(senderId) : senderId;
            const receiverObjId =
                typeof receiverId === "string"
                    ? new Types.ObjectId(receiverId)
                    : receiverId;
            const bookingObjId =
                typeof bookingId === "string" ? new Types.ObjectId(bookingId) : bookingId;

            const messageData: Partial<IMessage> = {
                conversationId: conversation._id,
                senderId: senderObjId,
                receiverId: receiverObjId,
                content: bookingDetails,
                messageType: "booking_request",
                bookingId: bookingObjId,
                isRead: false,
            };

            const message = await this._messageRepo.create(messageData);
            await this._conversationRepo.updateLastMessage(conversation._id, message._id);

            const populated = await this.populateMessage(message._id);
            return populated ?? message;
        } catch (error) {
            console.error("Error in handleBookingRequest:", error);
            throw error;
        }
    }

    async handleBookingAction(
        ownerId: string | Types.ObjectId,
        conversationId: string | Types.ObjectId,
        bookingId: string | Types.ObjectId,
        action: "approved" | "rejected",
    ): Promise<IMessage> {
        try {
            const conversation = await this._conversationRepo.findById(conversationId);
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            const ownerObjId =
                typeof ownerId === "string" ? new Types.ObjectId(ownerId) : ownerId;

            const renterId = conversation.participants.find(
                (p) => p.toString() !== ownerObjId.toString(),
            );

            if (!renterId) {
                throw new Error("Renter not found in conversation");
            }

            const bookingObjId =
                typeof bookingId === "string" ? new Types.ObjectId(bookingId) : bookingId;

<<<<<<< HEAD
=======
            const booking = await BookingModel.findById(bookingObjId);
            if (!booking) {
                throw new Error("Booking not found");
            }
            if (booking.bookingStatus !== "pending") {
                throw new Error(`Booking request is already ${booking.bookingStatus}`);
            }
            if (new Date(booking.startDate) < new Date()) {
                throw new Error("Booking date has already passed. Request expired.");
            }

>>>>>>> feat/chat
            const convObjId =
                typeof conversationId === "string"
                    ? new Types.ObjectId(conversationId)
                    : conversationId;

            const actionText =
                action === "approved"
                    ? "✅ Booking request approved! The booking is now confirmed."
                    : "❌ Booking request rejected. The booking has been declined.";

            const messageData: Partial<IMessage> = {
                conversationId: convObjId,
                senderId: ownerObjId,
                receiverId: renterId,
                content: actionText,
                messageType: "booking_action",
                bookingId: bookingObjId,
                bookingAction: action,
                isRead: false,
            };

            const message = await this._messageRepo.create(messageData);
            await this._conversationRepo.updateLastMessage(convObjId, message._id);

<<<<<<< HEAD
=======
            // Update booking status
            booking.bookingStatus = action === "approved" ? "confirmed" : "rejected";
            await booking.save();

>>>>>>> feat/chat
            const populated = await this.populateMessage(message._id);
            return populated ?? message;
        } catch (error) {
            console.error("Error in handleBookingAction:", error);
            throw error;
        }
    }
}
