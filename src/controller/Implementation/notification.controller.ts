import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { INotificationService } from "../../services/interfaces/notification.service.interface";
import { errorResponse, successResponse } from "../../utils/response.util";

interface AuthRequest extends Request {
	user?: {
		userId: string;
		name: string;
		role: string;
		email: string;
	};
}

export class NotificationController {
	private _notificationService: INotificationService;

	constructor(notificationService: INotificationService) {
		this._notificationService = notificationService;
	}

	async getNotifications(req: Request, res: Response): Promise<void> {
		try {
			const userId = (req as AuthRequest).user?.userId;
			if (!userId) {
				errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
				return;
			}

			const notifications =
				await this._notificationService.getUserNotifications(userId);
			const unreadCount =
				await this._notificationService.getUnreadCount(userId);

			successResponse(res, "Notifications fetched successfully", {
				notifications,
				unreadCount,
			});
		} catch (error) {
			console.error("Error fetching notifications:", error);
			errorResponse(
				res,
				"Failed to fetch notifications",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async markAsRead(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const notification = await this._notificationService.markAsRead(id);
			if (!notification) {
				errorResponse(res, "Notification not found", HttpStatus.NOT_FOUND);
				return;
			}
			successResponse(res, "Notification marked as read", notification);
		} catch (error) {
			console.error("Error marking notification as read:", error);
			errorResponse(
				res,
				"Failed to mark notification as read",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async deleteNotification(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const notification =
				await this._notificationService.deleteNotification(id);
			if (!notification) {
				errorResponse(res, "Notification not found", HttpStatus.NOT_FOUND);
				return;
			}
			successResponse(res, "Notification deleted", notification);
		} catch (error) {
			console.error("Error deleting notification:", error);
			errorResponse(
				res,
				"Failed to delete notification",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
