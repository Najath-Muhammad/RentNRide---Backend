import { Router } from "express";
import { AuthGuard } from "../middlewares/authGuard";
import { SubscriptionPlanRepo, UserSubscriptionRepo } from "../repositories/Implementation/subscription.repository";
import { SubscriptionService } from "../services/Implementation/subscription.service";
import { SubscriptionController } from "../controller/Implementation/subscription.controller";

const subscriptionRouter = Router();

const planRepo = new SubscriptionPlanRepo();
const userSubRepo = new UserSubscriptionRepo();
const subscriptionService = new SubscriptionService(planRepo, userSubRepo);
const subscriptionController = new SubscriptionController(subscriptionService);

// ── Admin: Plan Management ─────────────────────────────────────────────────
subscriptionRouter.get(
    "/admin/subscription-plans",
    AuthGuard(["admin"]),
    subscriptionController.getAllPlans.bind(subscriptionController),
);
subscriptionRouter.get(
    "/admin/subscription-plans/active",
    AuthGuard(["admin"]),
    subscriptionController.getActivePlans.bind(subscriptionController),
);
subscriptionRouter.get(
    "/admin/subscription-plans/:id",
    AuthGuard(["admin"]),
    subscriptionController.getPlanById.bind(subscriptionController),
);
subscriptionRouter.post(
    "/admin/subscription-plans",
    AuthGuard(["admin"]),
    subscriptionController.createPlan.bind(subscriptionController),
);
subscriptionRouter.put(
    "/admin/subscription-plans/:id",
    AuthGuard(["admin"]),
    subscriptionController.updatePlan.bind(subscriptionController),
);
subscriptionRouter.patch(
    "/admin/subscription-plans/:id/toggle",
    AuthGuard(["admin"]),
    subscriptionController.togglePlanStatus.bind(subscriptionController),
);

// ── Admin: User Subscription Management ───────────────────────────────────
subscriptionRouter.get(
    "/admin/user-subscriptions",
    AuthGuard(["admin"]),
    subscriptionController.getAllUserSubscriptions.bind(subscriptionController),
);
subscriptionRouter.post(
    "/admin/user-subscriptions/assign",
    AuthGuard(["admin"]),
    subscriptionController.assignSubscription.bind(subscriptionController),
);
subscriptionRouter.patch(
    "/admin/user-subscriptions/:id/cancel",
    AuthGuard(["admin"]),
    subscriptionController.cancelUserSubscription.bind(subscriptionController),
);

// ── User-Facing ────────────────────────────────────────────────────────────
subscriptionRouter.get(
    "/subscriptions/my",
    AuthGuard(["user", "premium", "admin"]),
    subscriptionController.getMySubscription.bind(subscriptionController),
);
subscriptionRouter.get(
    "/subscriptions/my/history",
    AuthGuard(["user", "premium", "admin"]),
    subscriptionController.getMySubscriptionHistory.bind(subscriptionController),
);

// Public: active plans (for users to browse)
subscriptionRouter.get(
    "/subscriptions/plans",
    subscriptionController.getActivePlans.bind(subscriptionController),
);

export default subscriptionRouter;
