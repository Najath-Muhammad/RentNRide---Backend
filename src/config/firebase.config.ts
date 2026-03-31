import admin from "firebase-admin";

let firebaseApp: admin.app.App | null = null;

// Sentinel: has initialization been attempted yet?
let initAttempted = false;

export function initFirebase(): admin.app.App | null {
    if (initAttempted) return firebaseApp;
    initAttempted = true;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // The private key is stored in .env with escaped \n — unescape them
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    // Skip gracefully if placeholder / missing values
    const isPlaceholder =
        !projectId ||
        !clientEmail ||
        !privateKey ||
        projectId === "your_project_id" ||
        privateKey.includes("YOUR_KEY_HERE");

    if (isPlaceholder) {
        console.warn(
            "[Firebase] ⚠️  Credentials not configured — push notifications are DISABLED.\n" +
            "            Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in backend/.env",
        );
        return null;
    }

    try {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
        console.log("[Firebase] ✅ Admin SDK initialized");
    } catch (err) {
        console.error("[Firebase] ❌ Failed to initialize Admin SDK:", err);
        firebaseApp = null;
    }

    return firebaseApp;
}

export function getFirebaseAdmin(): admin.app.App | null {
    return firebaseApp;
}
