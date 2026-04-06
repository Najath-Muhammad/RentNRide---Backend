import type { Document, Types } from "mongoose";

export interface INotification extends Document {
	userId: Types.ObjectId | string;
	title: string;
	message: string;
	type: string;
	metadata?: Record<string, unknown>;
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
}
