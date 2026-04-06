import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.coerce.number().default(5000),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	MONGODB_URI: z.string().url(),
	JWT_SECRET_KEY: z.string().min(1),
	JWT_REFRESH_SECRET_KEY: z.string().min(1),
	ACCESS_TOKEN_MAXAGE: z.coerce.number().default(900000),
	REFRESH_TOKEN_MAXAGE: z.coerce.number().default(604800000),
	NODEMAILER_EMAIL: z.string().optional(),
	NODEMAILER_PASSWORD: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	AWS_REGION: z.string().optional(),
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
	AWS_BUCKET_NAME: z.string().optional(),
	STRIPE_SECRET_KEY: z.string().min(1),
	STRIPE_WEBHOOK_SECRET: z.string().optional(),
	GROQ_API_KEY: z.string().optional(),
	FIREBASE_PROJECT_ID: z.string().optional(),
	FIREBASE_CLIENT_EMAIL: z.string().optional(),
	FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error(
		"❌ Invalid environment variables:",
		JSON.stringify(_env.error.format(), null, 2),
	);
	process.exit(1);
}

export const env = _env.data;
