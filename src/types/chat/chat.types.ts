import type { Document, Types } from "mongoose";

export type MessageType = "text" | "booking_request" | "booking_action";

export interface IMessage extends Document {
	_id: Types.ObjectId;
	conversationId: Types.ObjectId;
	senderId: Types.ObjectId;
	receiverId: Types.ObjectId;
	content: string;
	messageType: MessageType;
	bookingId?: Types.ObjectId;
	bookingAction?: "approved" | "rejected";
	isRead: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IConversation extends Document {
	_id: Types.ObjectId;
	participants: Types.ObjectId[];
	vehicleId: Types.ObjectId;
	lastMessage?: Types.ObjectId;
	lastMessageAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface SendMessageInput {
	conversationId?: string;
	receiverId: string;
	vehicleId?: string;
	content: string;
	messageType?: MessageType;
	bookingId?: string;
}

export interface GetOrCreateConversationInput {
	otherUserId: string;
	vehicleId?: string;
}
