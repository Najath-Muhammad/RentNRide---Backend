import mongoose, { Schema } from "mongoose";
import type { ISubscriptionPlan, IUserSubscription } from "../types/subscription/subscription.types";

// ── Subscription Plan ──────────────────────────────────────────────────────
const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        durationDays: { type: Number, required: true, min: 1 },
        vehicleLimit: { type: Number, required: true, min: 1 },
        features: [{ type: String }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

// ── User Subscription ──────────────────────────────────────────────────────
const UserSubscriptionSchema = new Schema<IUserSubscription>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled"],
            default: "active",
        },
        cancelledAt: { type: Date },
        cancelReason: { type: String, trim: true },
    },
    { timestamps: true },
);

UserSubscriptionSchema.index({ userId: 1, status: 1 });

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>(
    "SubscriptionPlan",
    SubscriptionPlanSchema,
);

export const UserSubscriptionModel = mongoose.model<IUserSubscription>(
    "UserSubscription",
    UserSubscriptionSchema,
);
