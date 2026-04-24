import admin from "firebase-admin";
import { env } from "../config/env";
import logger from "../utils/logger";

let firebaseApp: admin.app.App | null = null;

let initAttempted = false;

export function initFirebase(): admin.app.App | null {
	if (initAttempted) return firebaseApp;
	initAttempted = true;

	const projectId = env.FIREBASE_PROJECT_ID;
	const clientEmail = env.FIREBASE_CLIENT_EMAIL;
	const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

	const isPlaceholder =
		!projectId ||
		!clientEmail ||
		!privateKey ||
		projectId === "your_project_id" ||
		privateKey.includes("YOUR_KEY_HERE");

	if (isPlaceholder) {
		logger.warn(
			"[Firebase] ⚠️  Credentials not configured — push notifications are DISABLED.\n" +
				"            Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in backend/.env",
		);
		return null;
	}

	try {
		firebaseApp = admin.initializeApp({
			credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
		});
		logger.info("[Firebase] ✅ Admin SDK initialized");
	} catch (err) {
		logger.error("[Firebase] ❌ Failed to initialize Admin SDK:", err);
		firebaseApp = null;
	}

	return firebaseApp;
}

export function getFirebaseAdmin(): admin.app.App | null {
	return firebaseApp;
}
