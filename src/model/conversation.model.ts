import mongoose, { Schema } from "mongoose";
import type { IConversation } from "../types/chat/chat.types";

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        lastMessageAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ vehicleId: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const ConversationModel = mongoose.model<IConversation>(
    "Conversation",
    ConversationSchema,
);
