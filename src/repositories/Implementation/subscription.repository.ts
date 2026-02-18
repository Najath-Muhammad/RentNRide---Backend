import type { FilterQuery, Types } from "mongoose";
import { SubscriptionPlanModel, UserSubscriptionModel } from "../../model/subscription.model";
import type { ISubscriptionPlan, IUserSubscription } from "../../types/subscription/subscription.types";
import { BaseRepo } from "./base.repository";
import type { ISubscriptionPlanRepo, IUserSubscriptionRepo } from "../interfaces/subscription.interface";

// ── Plan Repository ────────────────────────────────────────────────────────
export class SubscriptionPlanRepo
    extends BaseRepo<ISubscriptionPlan>
    implements ISubscriptionPlanRepo {
    constructor() {
        super(SubscriptionPlanModel);
    }

    async findAllPlans(
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): Promise<{ data: ISubscriptionPlan[]; total: number; page: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const filter: FilterQuery<ISubscriptionPlan> = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        const [data, total] = await Promise.all([
            this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findActivePlans(): Promise<ISubscriptionPlan[]> {
        return this.model.find({ isActive: true }).sort({ price: 1 }).exec();
    }

    async toggleActive(id: string): Promise<ISubscriptionPlan | null> {
        const plan = await this.model.findById(id);
        if (!plan) return null;
        plan.isActive = !plan.isActive;
        return plan.save();
    }
}

// ── User Subscription Repository ───────────────────────────────────────────
export class UserSubscriptionRepo
    extends BaseRepo<IUserSubscription>
    implements IUserSubscriptionRepo {
    constructor() {
        super(UserSubscriptionModel);
    }

    async findActiveByUser(userId: string | Types.ObjectId): Promise<IUserSubscription | null> {
        return this.model
            .findOne({ userId, status: "active" })
            .populate("planId")
            .sort({ createdAt: -1 })
            .exec();
    }

    async findAllSubscriptions(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string,
    ): Promise<{ data: IUserSubscription[]; total: number; page: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const filter: FilterQuery<IUserSubscription> = {};
        if (status) filter.status = status;

        const query = this.model
            .find(filter)
            .populate("userId", "name email")
            .populate("planId", "name price durationDays vehicleLimit")
            .sort({ createdAt: -1 });

        if (search) {
            // search is applied post-populate via aggregation alternative — use lean + filter
            const all = await query.exec();
            const filtered = all.filter((s) => {
                const user = s.userId as unknown as { name?: string; email?: string };
                return (
                    user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    user?.email?.toLowerCase().includes(search.toLowerCase())
                );
            });
            const paginated = filtered.slice(skip, skip + limit);
            return {
                data: paginated,
                total: filtered.length,
                page,
                totalPages: Math.ceil(filtered.length / limit),
            };
        }

        const [data, total] = await Promise.all([
            query.skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findByUser(
        userId: string | Types.ObjectId,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: IUserSubscription[]; total: number; page: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const filter: FilterQuery<IUserSubscription> = { userId };
        const [data, total] = await Promise.all([
            this.model
                .find(filter)
                .populate("planId", "name price durationDays vehicleLimit features")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(filter).exec(),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async cancelSubscription(id: string, reason?: string): Promise<IUserSubscription | null> {
        return this.model
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        status: "cancelled",
                        cancelledAt: new Date(),
                        cancelReason: reason?.trim() || "Cancelled by admin",
                    },
                },
                { new: true },
            )
            .exec();
    }

    async expireStaleSubscriptions(): Promise<number> {
        const result = await this.model
            .updateMany(
                { status: "active", endDate: { $lt: new Date() } },
                { $set: { status: "expired" } },
            )
            .exec();
        return result.modifiedCount;
    }
}
