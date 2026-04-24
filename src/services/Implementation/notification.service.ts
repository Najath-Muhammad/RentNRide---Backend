import type { INotificationRepository } from "../../repositories/interfaces/notification.interface";
import type { INotification } from "../../types/notification/INotification";
import type { INotificationService } from "../interfaces/notification.service.interface";

export class NotificationService implements INotificationService {
	private _notificationRepo: INotificationRepository;

	constructor(notificationRepo: INotificationRepository) {
		this._notificationRepo = notificationRepo;
	}

	async createNotification(
		data: Partial<INotification>,
	): Promise<INotification> {
		return await this._notificationRepo.create(data);
	}

	async getUserNotifications(userId: string): Promise<INotification[]> {
		return await this._notificationRepo.findByUserId(userId);
	}

	async markAsRead(id: string): Promise<INotification | null> {
		return await this._notificationRepo.markAsRead(id);
	}

	async deleteNotification(id: string): Promise<INotification | null> {
		return await this._notificationRepo.delete(id);
	}

	async getUnreadCount(userId: string): Promise<number> {
		return await this._notificationRepo.getUnreadCount(userId);
	}
}
