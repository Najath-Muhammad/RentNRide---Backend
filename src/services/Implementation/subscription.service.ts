import type { Types } from "mongoose";
import type { ISubscriptionPlanRepo, IUserSubscriptionRepo } from "../../repositories/interfaces/subscription.interface";
import type { ISubscriptionPlan, IUserSubscription } from "../../types/subscription/subscription.types";
import type { ISubscriptionService } from "../Interfaces/subscription.interface.service";

export class SubscriptionService implements ISubscriptionService {
    constructor(
        private _planRepo: ISubscriptionPlanRepo,
        private _userSubRepo: IUserSubscriptionRepo,
    ) { }

    // ── Plan Management ────────────────────────────────────────────────────

    async getAllPlans(
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): Promise<{ data: ISubscriptionPlan[]; total: number; page: number; totalPages: number }> {
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
            if (data.durationDays < 1) throw new Error("Duration must be at least 1 day");
            if (data.vehicleLimit < 1) throw new Error("Vehicle limit must be at least 1");
            return await this._planRepo.create(data);
        } catch (error) {
            console.error("Error in createPlan:", error);
            throw error;
        }
    }

    async updatePlan(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
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

    // ── User Subscription Management ───────────────────────────────────────

    async getAllUserSubscriptions(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string,
    ): Promise<{ data: IUserSubscription[]; total: number; page: number; totalPages: number }> {
        try {
            // Auto-expire stale subscriptions first
            await this._userSubRepo.expireStaleSubscriptions();
            return await this._userSubRepo.findAllSubscriptions(page, limit, search, status);
        } catch (error) {
            console.error("Error in getAllUserSubscriptions:", error);
            throw error;
        }
    }

    async assignSubscription(userId: string, planId: string): Promise<IUserSubscription> {
        try {
            const plan = await this._planRepo.findById(planId);
            if (!plan) throw new Error("Subscription plan not found");
            if (!plan.isActive) throw new Error("Subscription plan is not active");

            // Cancel any existing active subscription
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

            return await this._userSubRepo.create({
                userId: userId as unknown as Types.ObjectId,
                planId: planId as unknown as Types.ObjectId,
                startDate,
                endDate,
                status: "active",
            });
        } catch (error) {
            console.error("Error in assignSubscription:", error);
            throw error;
        }
    }

    async cancelUserSubscription(id: string, reason?: string): Promise<IUserSubscription> {
        try {
            const sub = await this._userSubRepo.findById(id);
            if (!sub) throw new Error("Subscription not found");
            if (sub.status === "cancelled") throw new Error("Subscription is already cancelled");

            const cancelled = await this._userSubRepo.cancelSubscription(id, reason);
            if (!cancelled) throw new Error("Failed to cancel subscription");
            return cancelled;
        } catch (error) {
            console.error("Error in cancelUserSubscription:", error);
            throw error;
        }
    }

    // ── User-Facing ────────────────────────────────────────────────────────

    async getMySubscription(userId: string | Types.ObjectId): Promise<IUserSubscription | null> {
        try {
            await this._userSubRepo.expireStaleSubscriptions();
            return await this._userSubRepo.findActiveByUser(userId);
        } catch (error) {
            console.error("Error in getMySubscription:", error);
            throw error;
        }
    }

    async getMySubscriptionHistory(
        userId: string | Types.ObjectId,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: IUserSubscription[]; total: number; page: number; totalPages: number }> {
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
            if (!sub) return 1; // default: free users can list 1 vehicle
            const plan = sub.planId as unknown as ISubscriptionPlan;
            return plan?.vehicleLimit ?? 1;
        } catch (error) {
            console.error("Error in getUserVehicleLimit:", error);
            return 1;
        }
    }
}
