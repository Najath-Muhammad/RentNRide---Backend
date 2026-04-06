import type { INotification } from "../../types/notification/INotification";

export interface INotificationRepository {
	create(data: Partial<INotification>): Promise<INotification>;
	findByUserId(userId: string): Promise<INotification[]>;
	markAsRead(id: string): Promise<INotification | null>;
	delete(id: string): Promise<INotification | null>;
	getUnreadCount(userId: string): Promise<number>;
}
