import mongoose, { Schema } from "mongoose";
import type { IMessage } from "../types/chat/chat.types";

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        messageType: {
            type: String,
            enum: ["text", "booking_request", "booking_action"],
            default: "text",
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        },
        bookingAction: {
            type: String,
            enum: ["approved", "rejected"],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
