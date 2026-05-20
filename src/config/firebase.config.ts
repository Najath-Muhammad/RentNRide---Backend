import admin from "firebase-admin";
import { env } from "../config/env";
import logger from "../utils/logger";

let firebaseApp: admin.app.App | null = null;

// Sentinel: has initialization been attempted yet?
let initAttempted = false;

export function initFirebase(): admin.app.App | null {
	if (initAttempted) return firebaseApp;
	initAttempted = true;

	const projectId = env.FIREBASE_PROJECT_ID;
	const clientEmail = env.FIREBASE_CLIENT_EMAIL;
	let privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

	if (privateKey) {
		// Strip surrounding double/single quotes that might be injected by hosting dashboards
		if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
			privateKey = privateKey.slice(1, -1);
		} else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
			privateKey = privateKey.slice(1, -1);
		}
	}

	// Skip gracefully if placeholder / missing values
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
