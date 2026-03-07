import Stripe from "stripe";
import { config } from "dotenv";

config();

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY is missing in env variables.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2025-02-24.acacia" as any, // or your default version
});
