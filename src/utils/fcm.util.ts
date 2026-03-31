import admin from "firebase-admin";
import { UserModel } from "../model/user.model";
import { getFirebaseAdmin } from "../config/firebase.config";

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Send an FCM push notification to all tokens belonging to a user.
 * Invalid / expired tokens are automatically removed from the DB.
 * Silently no-ops if Firebase Admin was not initialized (missing creds).
 */
export async function sendPushNotification(
    userId: string,
    payload: NotificationPayload,
): Promise<void> {
    // No-op if Firebase isn't configured yet
    if (!getFirebaseAdmin()) {
        console.warn("[FCM] Skipped — Firebase not initialized");
        return;
    }

    try {
        console.log(`[FCM] Attempting to send "${payload.title}" to userId: ${userId}`);
        const user = await UserModel.findById(userId).select("fcmTokens");

        if (!user) {
            console.warn(`[FCM] User not found in DB: ${userId}`);
            return;
        }

        if (!user.fcmTokens || user.fcmTokens.length === 0) {
            console.warn(`[FCM] User ${userId} has NO fcmTokens — token was never registered`);
            return;
        }

        console.log(`[FCM] Found ${user.fcmTokens.length} token(s) for user ${userId}`);

        const tokens: string[] = user.fcmTokens;

        const message: admin.messaging.MulticastMessage = {
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data ?? {},
            // Web push config
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

        // Collect invalid tokens to clean up
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
                console.warn(`[FCM] Failed to send to token[${idx}]:`, res.error?.message);
            }
        });

        // Remove stale tokens from DB
        if (invalidTokens.length > 0) {
            await UserModel.findByIdAndUpdate(userId, {
                $pull: { fcmTokens: { $in: invalidTokens } },
            });
            console.log(`[FCM] Removed ${invalidTokens.length} stale token(s) for user ${userId}`);
        }

        console.log(
            `[FCM] Sent to ${response.successCount}/${tokens.length} token(s) for user ${userId}`,
        );
    } catch (error) {
        // Never let a notification failure crash the caller
        console.error("[FCM] sendPushNotification error:", error);
    }
}
