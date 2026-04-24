import admin from "firebase-admin";
import { getFirebaseAdmin } from "../config/firebase.config";
import { NotificationModel } from "../model/notification.model";
import { UserModel } from "../model/user.model";

export interface NotificationPayload {
	title: string;
	body: string;
	data?: Record<string, string>;
}

export async function sendPushNotification(userId: string, payload: NotificationPayload): Promise<void> {
	try {
		await NotificationModel.create({
			userId,
			title: payload.title,
			message: payload.body,
			type: payload.data?.type || "system",
			metadata: payload.data,
			isRead: false,
		});
	} catch (err) {
		console.error("Failed to save persistent notification to DB:", err);
	}

	if (!getFirebaseAdmin()) {
		console.warn("[FCM] Skipped — Firebase not initialized");
		return;
	}

	try {
        const user = await UserModel.findById(userId).select("fcmTokens");

        if (!user) {
			console.warn(`[FCM] User not found in DB: ${userId}`);
			return;
		}

        if (!user.fcmTokens || user.fcmTokens.length === 0) {
			console.warn(
				`[FCM] User ${userId} has NO fcmTokens — token was never registered`,
			);
			return;
		}

        const tokens: string[] = user.fcmTokens;

        const message: admin.messaging.MulticastMessage = {
			tokens,
			notification: {
				title: payload.title,
				body: payload.body,
			},
			data: payload.data ?? {},
			webpush: {
				notification: {
					icon: "/vite.svg",
					badge: "/vite.svg",
				},
				fcmOptions: {
					link: "/",
				},
			},
		};

        const response = await admin.messaging().sendEachForMulticast(message);

        const invalidTokens: string[] = [];
        response.responses.forEach((res, idx) => {
			if (!res.success) {
				const code = res.error?.code;
				if (
					code === "messaging/invalid-registration-token" ||
					code === "messaging/registration-token-not-registered"
				) {
					invalidTokens.push(tokens[idx]);
				}
				console.warn(
					`[FCM] Failed to send to token[${idx}]:`,
					res.error?.message,
				);
			}
		});

        if (invalidTokens.length > 0) {
            await UserModel.findByIdAndUpdate(userId, {
				$pull: { fcmTokens: { $in: invalidTokens } },
			});
        }
    } catch (error) {
		console.error("[FCM] sendPushNotification error:", error);
	}
}
