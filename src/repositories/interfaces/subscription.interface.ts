import type { Types } from "mongoose";
import type {
	ISubscriptionPlan,
	IUserSubscription,
} from "../../types/subscription/subscription.types";
import type { IBaseRepo } from "./base.interface";

export interface ISubscriptionPlanRepo extends IBaseRepo<ISubscriptionPlan> {
	findAllPlans(
		page?: number,
		limit?: number,
		search?: string,
	): Promise<{
		data: ISubscriptionPlan[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	findActivePlans(): Promise<ISubscriptionPlan[]>;
	toggleActive(id: string): Promise<ISubscriptionPlan | null>;
}

export interface IUserSubscriptionRepo extends IBaseRepo<IUserSubscription> {
	findActiveByUser(
		userId: string | Types.ObjectId,
	): Promise<IUserSubscription | null>;
	findAllSubscriptions(
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
	findByUser(
		userId: string | Types.ObjectId,
		page?: number,
		limit?: number,
	): Promise<{
		data: IUserSubscription[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	cancelSubscription(
		id: string,
		reason?: string,
	): Promise<IUserSubscription | null>;
	expireStaleSubscriptions(): Promise<number>;
}
