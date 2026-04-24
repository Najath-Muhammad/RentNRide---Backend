import mongoose, { Schema } from "mongoose";
import type { INotification } from "../types/notification/INotification";

const notificationSchema = new Schema<INotification>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		title: { type: String, required: true },
		message: { type: String, required: true },
		type: { type: String, required: true, default: "system" },
		metadata: { type: Schema.Types.Mixed },
		isRead: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	},
);

export const NotificationModel = mongoose.model<INotification>(
	"Notification",
	notificationSchema,
);
