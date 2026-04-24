import { Router } from "express";
import { ADMIN_ONLY, ALL_ROLES } from "../constants/roles";
import { SubscriptionController } from "../controller/Implementation/subscription.controller";
import { AuthGuard } from "../middlewares/authGuard";
import {
	SubscriptionPlanRepo,
	UserSubscriptionRepo,
} from "../repositories/Implementation/subscription.repository";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { SubscriptionService } from "../services/Implementation/subscription.service";

const subscriptionRouter = Router();

const planRepo = new SubscriptionPlanRepo();
const userSubRepo = new UserSubscriptionRepo();
const userRepo = new UserRepo();
const subscriptionService = new SubscriptionService(
	planRepo,
	userSubRepo,
	userRepo,
);
const subscriptionController = new SubscriptionController(subscriptionService);

subscriptionRouter.get(
	"/admin/subscription-plans",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.getAllPlans.bind(subscriptionController),
);
subscriptionRouter.get(
	"/admin/subscription-plans/active",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.getActivePlans.bind(subscriptionController),
);
subscriptionRouter.get(
	"/admin/subscription-plans/:id",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.getPlanById.bind(subscriptionController),
);
subscriptionRouter.post(
	"/admin/subscription-plans",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.createPlan.bind(subscriptionController),
);
subscriptionRouter.put(
	"/admin/subscription-plans/:id",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.updatePlan.bind(subscriptionController),
);
subscriptionRouter.patch(
	"/admin/subscription-plans/:id/toggle",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.togglePlanStatus.bind(subscriptionController),
);

subscriptionRouter.get(
	"/admin/user-subscriptions",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.getAllUserSubscriptions.bind(subscriptionController),
);
subscriptionRouter.post(
	"/admin/user-subscriptions/assign",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.assignSubscription.bind(subscriptionController),
);
subscriptionRouter.patch(
	"/admin/user-subscriptions/:id/cancel",
	AuthGuard(ADMIN_ONLY),
	subscriptionController.cancelUserSubscription.bind(subscriptionController),
);

subscriptionRouter.get(
	"/subscriptions/my",
	AuthGuard(ALL_ROLES),
	subscriptionController.getMySubscription.bind(subscriptionController),
);
subscriptionRouter.get(
	"/subscriptions/my/history",
	AuthGuard(ALL_ROLES),
	subscriptionController.getMySubscriptionHistory.bind(subscriptionController),
);

subscriptionRouter.get(
	"/subscriptions/plans",
	subscriptionController.getActivePlans.bind(subscriptionController),
);

subscriptionRouter.post(
	"/subscriptions/subscribe",
	AuthGuard(ALL_ROLES),
	subscriptionController.selfSubscribe.bind(subscriptionController),
);

subscriptionRouter.post(
	"/subscriptions/payment-intent",
	AuthGuard(ALL_ROLES),
	subscriptionController.createSubscriptionPaymentIntent.bind(
		subscriptionController,
	),
);

subscriptionRouter.post(
	"/subscriptions/verify-payment",
	AuthGuard(ALL_ROLES),
	subscriptionController.verifySubscriptionPayment.bind(subscriptionController),
);

export default subscriptionRouter;
