import { z } from "zod";

// Wallet
export const fundWalletSchema = z.object({
	amount: z.coerce.number().min(10, "Invalid amount. Must be at least ₹10."),
});
export const verifyPaymentIntentSchema = z.object({
	paymentIntentId: z.string().min(1, "Payment Intent ID is required"),
});

// Booking
export const createBookingSchema = z.object({
	vehicleId: z.string().min(1, "Vehicle ID is required"),
	ownerId: z.string().min(1, "Owner ID is required"),
	startDate: z.union([z.string(), z.date()]),
	endDate: z.union([z.string(), z.date()]),
	withFuel: z.boolean(),
	pricePerDay: z.number().positive(),
	totalAmount: z.number().positive(),
	advancePaid: z.number().nonnegative().optional(),
});
export const reasonSchema = z.object({ reason: z.string().optional() });
export const rejectReasonSchema = z.object({
	reason: z
		.string()
		.min(
			10,
			"Rejection reason is required and should be at least 10 characters",
		),
});
export const bookingIdSchema = z.object({
	bookingId: z.string().min(1, "Booking ID is required"),
});

// User
export const updateProfileSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters").optional(),
		phone: z.coerce.string().optional(),
	})
	.passthrough();
export const updateProfilePhotoSchema = z.object({
	profilePhoto: z.string().url("Invalid URL"),
});
export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Subscription
export const createPlanSchema = z.object({
	name: z.string().min(1, "Plan name is required"),
	description: z.string().optional(),
	price: z.coerce.number().min(0, "Valid price is required"),
	durationDays: z.coerce.number().min(1, "Valid duration is required"),
	vehicleLimit: z.coerce.number().min(1, "Valid vehicle limit is required"),
	features: z.array(z.string()).optional(),
});
export const updatePlanSchema = z.object({
	name: z.string().min(1, "Plan name is required").optional(),
	description: z.string().optional(),
	price: z.coerce.number().min(0, "Valid price is required").optional(),
	durationDays: z.coerce
		.number()
		.min(1, "Valid duration is required")
		.optional(),
	vehicleLimit: z.coerce
		.number()
		.min(1, "Valid vehicle limit is required")
		.optional(),
	features: z.array(z.string()).optional(),
});
export const assignSubscriptionSchema = z.object({
	userId: z.string().min(1, "userId is required"),
	planId: z.string().min(1, "planId is required"),
});
export const planIdSchema = z.object({
	planId: z.string().min(1, "planId is required"),
});

// Review
export const reviewSchema = z.object({
	vehicleId: z.string().min(1, "vehicleId is required"),
	bookingId: z.string().min(1, "bookingId is required"),
	rating: z.coerce.number().min(1).max(5),
	comment: z.string().default(""),
});

// File
export const fileUploadSchema = z.object({
	fileName: z.string().min(1, "fileName is required"),
	fileType: z.string().min(1, "fileType is required"),
});

// FCM
export const fcmTokenSchema = z.object({
	token: z.string().min(1, "FCM token is required"),
});

// Chatbot
export const chatMessageSchema = z.object({
	message: z.string().min(1, "Message is required"),
});

// Chat
export const initiateChatSchema = z.object({
	otherUserId: z.string().min(1, "otherUserId is required"),
	vehicleId: z.string().optional(),
});
export const sendMessageSchema = z.object({
	conversationId: z.string().optional(),
	receiverId: z.string().min(1, "receiverId is required"),
	vehicleId: z.string().optional(),
	content: z.string().min(1, "content is required"),
	messageType: z.enum(["text", "booking_request", "booking_action"]).optional(),
	bookingId: z.string().optional(),
});
export const bookingActionSchema = z.object({
	bookingId: z.string().min(1, "bookingId is required"),
	action: z.enum(["approved", "rejected"]),
});

// Admin Category
export const createCategorySchema = z.object({
	name: z.string().min(1, "Category name is required"),
	description: z.string().optional(),
	subCategories: z.array(z.any()).optional(),
});
export const updateCategorySchema = z.object({
	name: z.string().min(1, "Category name is required").optional(),
	description: z.string().optional(),
	subCategories: z.array(z.any()).optional(),
});
export const fuelTypeSchema = z.object({
	name: z.string().min(1, "Fuel type name is required"),
});
export const updateFuelTypeSchema = z.object({
	name: z.string().min(1, "Fuel type name is required").optional(),
});
