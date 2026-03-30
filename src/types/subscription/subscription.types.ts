import type { Document, Types } from "mongoose";

export interface ISubscriptionPlan extends Document {
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    vehicleLimit: number;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserSubscription extends Document {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired" | "cancelled";
    cancelledAt?: Date;
    cancelReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
