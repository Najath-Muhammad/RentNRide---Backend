import type { Types } from "mongoose";
import type {
	ISubscriptionPlan,
	IUserSubscription,
} from "../../types/subscription/subscription.types";

export interface ISubscriptionService {
	// Plan management (admin)
	getAllPlans(
		page?: number,
		limit?: number,
		search?: string,
	): Promise<{
		data: ISubscriptionPlan[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	getActivePlans(): Promise<ISubscriptionPlan[]>;
	getPlanById(id: string): Promise<ISubscriptionPlan>;
	createPlan(data: {
		name: string;
		description?: string;
		price: number;
		durationDays: number;
		vehicleLimit: number;
		features?: string[];
	}): Promise<ISubscriptionPlan>;
	updatePlan(
		id: string,
		data: Partial<ISubscriptionPlan>,
	): Promise<ISubscriptionPlan>;
	togglePlanStatus(id: string): Promise<ISubscriptionPlan>;

	// User subscription management (admin)
	getAllUserSubscriptions(
		page?: number,
		limit?: number,
		search?: string,
		status?: string,
	): Promise<{
		data: IUserSubscription[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	assignSubscription(
		userId: string,
		planId: string,
		amountOverride?: number,
	): Promise<IUserSubscription>;
	cancelUserSubscription(
		id: string,
		reason?: string,
	): Promise<IUserSubscription>;

	// User-facing
	getMySubscription(
		userId: string | Types.ObjectId,
	): Promise<IUserSubscription | null>;
	getMySubscriptionHistory(
		userId: string | Types.ObjectId,
		page?: number,
		limit?: number,
	): Promise<{
		data: IUserSubscription[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	getUserVehicleLimit(userId: string | Types.ObjectId): Promise<number>;
	createSubscriptionPaymentIntent(
		userId: string,
		planId: string,
	): Promise<{ clientSecret: string; amount: number; planName: string }>;
	activateSubscriptionAfterPayment(
		userId: string,
		planId: string,
	): Promise<IUserSubscription>;
	verifySubscriptionPayment(
		userId: string,
		paymentIntentId: string,
	): Promise<IUserSubscription>;
}
