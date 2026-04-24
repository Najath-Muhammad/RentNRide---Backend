import { Router } from "express";
import { ALL_ROLES } from "../constants/roles";
import { NotificationController } from "../controller/Implementation/notification.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { NotificationRepository } from "../repositories/Implementation/notification.repository";
import { NotificationService } from "../services/Implementation/notification.service";

const notificationRouter = Router();

const notificationRepo = new NotificationRepository();
const notificationService = new NotificationService(notificationRepo);
const notificationController = new NotificationController(notificationService);

notificationRouter.use(AuthGuard(ALL_ROLES));

notificationRouter.get(
	"/",
	notificationController.getNotifications.bind(notificationController),
);
notificationRouter.patch(
	"/:id/read",
	notificationController.markAsRead.bind(notificationController),
);
notificationRouter.delete(
	"/:id",
	notificationController.deleteNotification.bind(notificationController),
);

export default notificationRouter;
