import type { Types } from "mongoose";
import { stripe } from "../../config/stripe.config";
import { ROLES } from "../../constants/roles";

import type {
	ISubscriptionPlanRepo,
	IUserSubscriptionRepo,
} from "../../repositories/interfaces/subscription.interface";
import type { IUserRepository } from "../../repositories/interfaces/user.interface";
import type {
	ISubscriptionPlan,
	IUserSubscription,
} from "../../types/subscription/subscription.types";
import type { ISubscriptionService } from "../interfaces/subscription.interface.service";

export class SubscriptionService implements ISubscriptionService {
	constructor(
		private _planRepo: ISubscriptionPlanRepo,
		private _userSubRepo: IUserSubscriptionRepo,
		private _userRepo: IUserRepository,
	) {}

	async getAllPlans(
		page: number = 1,
		limit: number = 10,
		search?: string,
	): Promise<{
		data: ISubscriptionPlan[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		try {
			return await this._planRepo.findAllPlans(page, limit, search);
		} catch (error) {
			console.error("Error in getAllPlans:", error);
			throw error;
		}
	}

	async getActivePlans(): Promise<ISubscriptionPlan[]> {
		try {
			return await this._planRepo.findActivePlans();
		} catch (error) {
			console.error("Error in getActivePlans:", error);
			throw error;
		}
	}

	async getPlanById(id: string): Promise<ISubscriptionPlan> {
		try {
			const plan = await this._planRepo.findById(id);
			if (!plan) throw new Error("Subscription plan not found");
			return plan;
		} catch (error) {
			console.error("Error in getPlanById:", error);
			throw error;
		}
	}

	async createPlan(data: {
		name: string;
		description?: string;
		price: number;
		durationDays: number;
		vehicleLimit: number;
		features?: string[];
	}): Promise<ISubscriptionPlan> {
		try {
			if (!data.name?.trim()) throw new Error("Plan name is required");
			if (data.price < 0) throw new Error("Price cannot be negative");
			if (data.durationDays < 1)
				throw new Error("Duration must be at least 1 day");
			if (data.vehicleLimit < 1)
				throw new Error("Vehicle limit must be at least 1");
			return await this._planRepo.create(data);
		} catch (error) {
			console.error("Error in createPlan:", error);
			throw error;
		}
	}

	async updatePlan(
		id: string,
		data: Partial<ISubscriptionPlan>,
	): Promise<ISubscriptionPlan> {
		try {
			const updated = await this._planRepo.updateById(id, data);
			if (!updated) throw new Error("Subscription plan not found");
			return updated;
		} catch (error) {
			console.error("Error in updatePlan:", error);
			throw error;
		}
	}

	async togglePlanStatus(id: string): Promise<ISubscriptionPlan> {
		try {
			const plan = await this._planRepo.toggleActive(id);
			if (!plan) throw new Error("Subscription plan not found");
			return plan;
		} catch (error) {
			console.error("Error in togglePlanStatus:", error);
			throw error;
		}
	}

	async getAllUserSubscriptions(
		page: number = 1,
		limit: number = 10,
		search?: string,
		status?: string,
	): Promise<{
		data: IUserSubscription[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		try {
			await this._userSubRepo.expireStaleSubscriptions();
			return await this._userSubRepo.findAllSubscriptions(
				page,
				limit,
				search,
				status,
			);
		} catch (error) {
			console.error("Error in getAllUserSubscriptions:", error);
			throw error;
		}
	}

	async assignSubscription(
		userId: string,
		planId: string,
		amountOverride?: number,
	): Promise<IUserSubscription> {
		try {
			const plan = await this._planRepo.findById(planId);
			if (!plan) throw new Error("Subscription plan not found");
			if (!plan.isActive) throw new Error("Subscription plan is not active");

			const existing = await this._userSubRepo.findActiveByUser(userId);
			if (existing) {
				await this._userSubRepo.cancelSubscription(
					(existing._id as Types.ObjectId).toString(),
					"Replaced by new subscription",
				);
			}

			const startDate = new Date();
			const endDate = new Date();
			endDate.setDate(endDate.getDate() + plan.durationDays);

			const sub = await this._userSubRepo.create({
				userId: userId as unknown as Types.ObjectId,
				planId: planId as unknown as Types.ObjectId,
				startDate,
				endDate,
				status: "active",
				amountPaid: amountOverride ?? plan.price,
			});

			await this._userRepo.updateById(userId, {
				role: ROLES.PREMIUM,
				premiumExpiresAt: endDate,
			});

			return sub;
		} catch (error) {
			console.error("Error in assignSubscription:", error);
			throw error;
		}
	}

	async cancelUserSubscription(
		id: string,
		reason?: string,
	): Promise<IUserSubscription> {
		try {
			const sub = await this._userSubRepo.findById(id);
			if (!sub) throw new Error("Subscription not found");
			if (sub.status === "cancelled")
				throw new Error("Subscription is already cancelled");

			const cancelled = await this._userSubRepo.cancelSubscription(id, reason);
			if (!cancelled) throw new Error("Failed to cancel subscription");

			const userId = (sub.userId as Types.ObjectId).toString();
			await this._userRepo.updateById(userId, {
				role: ROLES.USER,
				premiumExpiresAt: undefined,
			});

			return cancelled;
		} catch (error) {
			console.error("Error in cancelUserSubscription:", error);
			throw error;
		}
	}

	async getMySubscription(
		userId: string | Types.ObjectId,
	): Promise<IUserSubscription | null> {
		try {
			await this._userSubRepo.expireStaleSubscriptions();
			const active = await this._userSubRepo.findActiveByUser(userId);

			// If no active subscription, ensure user role is reset (handles auto-expiry)
			if (!active) {
				await this._userRepo.updateById(userId.toString(), {
					role: ROLES.USER,
					premiumExpiresAt: undefined,
				});
			}

			return active;
		} catch (error) {
			console.error("Error in getMySubscription:", error);
			throw error;
		}
	}

	async getMySubscriptionHistory(
		userId: string | Types.ObjectId,
		page: number = 1,
		limit: number = 10,
	): Promise<{
		data: IUserSubscription[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		try {
			return await this._userSubRepo.findByUser(userId, page, limit);
		} catch (error) {
			console.error("Error in getMySubscriptionHistory:", error);
			throw error;
		}
	}

	async getUserVehicleLimit(userId: string | Types.ObjectId): Promise<number> {
		try {
			const sub = await this._userSubRepo.findActiveByUser(userId);
			if (!sub) return 1;
			const plan = sub.planId as unknown as ISubscriptionPlan;
			return plan?.vehicleLimit ?? 1;
		} catch (error) {
			console.error("Error in getUserVehicleLimit:", error);
			return 1;
		}
	}

	async createSubscriptionPaymentIntent(
		userId: string,
		planId: string,
	): Promise<{ clientSecret: string; amount: number; planName: string }> {
		try {
			const plan = await this._planRepo.findById(planId);
			if (!plan) throw new Error("Subscription plan not found");
			if (!plan.isActive)
				throw new Error("This subscription plan is no longer available");
			if (plan.price <= 0)
				throw new Error("This plan is free — no payment needed");

			const existing = await this._userSubRepo.findActiveByUser(userId);
			let displayPrice = plan.price;

			if (existing) {
				if (existing.planId.toString() === planId) {
					throw new Error("You already have this plan active");
				}

				// Proration logic: Calculate credit from the remaining time on current plan
				const now = new Date();
				const totalDuration =
					existing.endDate.getTime() - existing.startDate.getTime();
				const remainingDuration = existing.endDate.getTime() - now.getTime();

				if (remainingDuration > 0 && totalDuration > 0) {
					const credit =
						(remainingDuration / totalDuration) * (existing.amountPaid || 0);
					displayPrice = Math.max(0, plan.price - credit);
				}
			}

			// Ensure a minimum charge for Stripe (at least 1 INR)
			const finalAmount = Math.max(1, displayPrice);
			const amountInPaise = Math.round(finalAmount * 100);

			const paymentIntent = await stripe.paymentIntents.create({
				amount: amountInPaise,
				currency: "inr",
				metadata: {
					purpose: "subscription",
					userId,
					planId,
					planName: plan.name,
				},
			});

			return {
				clientSecret: paymentIntent.client_secret as string,
				amount: finalAmount,
				planName: plan.name,
			};
		} catch (error) {
			console.error("Error in createSubscriptionPaymentIntent:", error);
			throw error;
		}
	}

	async activateSubscriptionAfterPayment(
		userId: string,
		planId: string,
	): Promise<IUserSubscription> {
		try {
			return await this.assignSubscription(userId, planId);
		} catch (error) {
			console.error("Error in activateSubscriptionAfterPayment:", error);
			throw error;
		}
	}

	async verifySubscriptionPayment(
		userId: string,
		paymentIntentId: string,
	): Promise<IUserSubscription> {
		try {
			const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
			if (!intent || intent.status !== "succeeded") {
				throw new Error("Payment has not succeeded");
			}
			if (
				intent.metadata.purpose !== "subscription" ||
				intent.metadata.userId !== userId
			) {
				throw new Error("Invalid payment intent for this action");
			}

			const planId = intent.metadata.planId;
			const existing = await this._userSubRepo.findActiveByUser(userId);

			// If the webhook already processed this, don't do it again
			if (existing && existing.planId.toString() === planId) {
				return existing;
			}

			return await this.assignSubscription(userId, planId, intent.amount / 100);
		} catch (error) {
			console.error("Error verifying subscription payment:", error);
			throw error;
		}
	}
}
