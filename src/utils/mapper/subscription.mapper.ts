import type {
	ISubscriptionPlan,
	IUserSubscription,
} from "../../types/subscription/subscription.types";

export const subscriptionPlanDTO = (
	plan: ISubscriptionPlan,
): Partial<ISubscriptionPlan> => {
	return {
		_id: plan._id,
		name: plan.name,
		description: plan.description,
		price: plan.price,
		durationDays: plan.durationDays,
		vehicleLimit: plan.vehicleLimit,
		features: plan.features,
		isActive: plan.isActive,
		createdAt: plan.createdAt,
		updatedAt: plan.updatedAt,
	};
};

export const userSubscriptionDTO = (
	sub: IUserSubscription,
): Partial<IUserSubscription> => {
	return {
		_id: sub._id,
		userId: sub.userId,
		planId: sub.planId,
		startDate: sub.startDate,
		endDate: sub.endDate,
		status: sub.status,
		amountPaid: sub.amountPaid,
		cancelledAt: sub.cancelledAt,
		cancelReason: sub.cancelReason,
		createdAt: sub.createdAt,
		updatedAt: sub.updatedAt,
	};
};
