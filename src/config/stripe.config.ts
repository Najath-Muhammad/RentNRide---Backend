import { config } from "dotenv";
import Stripe from "stripe";
import { env } from "../config/env";

config();

if (!env.STRIPE_SECRET_KEY) {
	console.warn("STRIPE_SECRET_KEY is missing in env variables.");
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_dummy", {
	apiVersion: "2026-02-25.clover", // or your default version
});
