import { z } from "zod";

export const signupSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const verifyEmailSchema = z.object({
	email: z.string().email(),
});

export const verifyOtpSchema = z.object({
	otp: z.string().length(6),
	email: z.string().email(),
});

export const verifyForgotPasswordSchema = z.object({
	email: z.string().email(),
});

export const resetPassword = z.object({
	email: z.string().email(),
	new_password: z.string().min(6),
});

export const changePasswordSchema = z.object({
	old_password: z.string().min(1),
	new_password: z.string().min(6),
});
