import { NotificationModel } from "../../model/notification.model";
import type { INotification } from "../../types/notification/INotification";
import type { INotificationRepository } from "../interfaces/notification.interface";

export class NotificationRepository implements INotificationRepository {
	async create(data: Partial<INotification>): Promise<INotification> {
		return await NotificationModel.create(data);
	}

	async findByUserId(userId: string): Promise<INotification[]> {
		return await NotificationModel.find({ userId }).sort({ createdAt: -1 });
	}

	async markAsRead(id: string): Promise<INotification | null> {
		return await NotificationModel.findByIdAndUpdate(
			id,
			{ isRead: true },
			{ new: true },
		);
	}

	async delete(id: string): Promise<INotification | null> {
		return await NotificationModel.findByIdAndDelete(id);
	}

	async getUnreadCount(userId: string): Promise<number> {
		return await NotificationModel.countDocuments({ userId, isRead: false });
	}
}
