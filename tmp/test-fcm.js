/**
 * Quick FCM test script — run from the backend directory:
 *   node tmp/test-fcm.js
 *
 * Paste your FCM token from localStorage into TOKEN below.
 * Delete this file after testing.
 */

require("dotenv").config({ path: "./.env" });
const admin = require("firebase-admin");

const TOKEN = "PASTE_YOUR_TOKEN_FROM_LOCALSTORAGE_HERE";

if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === "your_project_id") {
    console.error("❌ FIREBASE_PROJECT_ID is not set in backend/.env");
    process.exit(1);
}

if (TOKEN === "PASTE_YOUR_TOKEN_FROM_LOCALSTORAGE_HERE") {
    console.error("❌ Replace TOKEN with your actual FCM token from localStorage.getItem('fcm_token')");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
});

admin.messaging()
    .send({
        token: TOKEN,
        notification: {
            title: "Car Booked 🚗",
            body: "Your car has been booked successfully",
        },
        webpush: {
            notification: { icon: "/vite.svg" },
        },
    })
    .then((res) => {
        console.log("✅ Notification sent successfully! Message ID:", res);
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Failed to send notification:", err.message);
        process.exit(1);
    });
