import type { INotification } from "../../types/notification/INotification";

export interface INotificationService {
	createNotification(data: Partial<INotification>): Promise<INotification>;
	getUserNotifications(userId: string): Promise<INotification[]>;
	markAsRead(id: string): Promise<INotification | null>;
	deleteNotification(id: string): Promise<INotification | null>;
	getUnreadCount(userId: string): Promise<number>;
}
