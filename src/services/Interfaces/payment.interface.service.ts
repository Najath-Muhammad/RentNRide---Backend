import type { Types } from "mongoose";

export interface IPaymentService {
	createAdvancePaymentIntent(
		bookingId: string | Types.ObjectId,
		userId: string | Types.ObjectId,
	): Promise<{ clientSecret: string; amount: number }>;
	capturePayment(
		bookingId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }>;
	verifyAdvancePayment(
		bookingId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }>;
	cancelPaymentIntent(
		bookingId: string | Types.ObjectId,
	): Promise<{ success: boolean; message: string }>;
	handleWebhook(body: Buffer | string, signature: string): Promise<void>;
}
