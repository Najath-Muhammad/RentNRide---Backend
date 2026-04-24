import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { ISubscriptionService } from "../../services/interfaces/subscription.interface.service";
import type {
	ISubscriptionPlan,
	IUserSubscription,
} from "../../types/subscription/subscription.types";
import {
	subscriptionPlanDTO,
	userSubscriptionDTO,
} from "../../utils/mapper/subscription.mapper";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	assignSubscriptionSchema,
	createPlanSchema,
	planIdSchema,
	reasonSchema,
	updatePlanSchema,
	verifyPaymentIntentSchema,
} from "../../validations/commonValidation";

export class SubscriptionController {
	constructor(private _subscriptionService: ISubscriptionService) {}

	async getAllPlans(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const search = req.query.search as string | undefined;
			const result = await this._subscriptionService.getAllPlans(
				page,
				limit,
				search,
			);
			const mappedResult = {
				...result,
				data: result.data.map((plan: ISubscriptionPlan) =>
					subscriptionPlanDTO(plan),
				),
			};
			return successResponse(
				res,
				"Subscription plans fetched successfully",
				mappedResult,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to fetch plans",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getActivePlans(
		_req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const plans = await this._subscriptionService.getActivePlans();
			return successResponse(
				res,
				"Active plans fetched successfully",
				plans.map((p: ISubscriptionPlan) => subscriptionPlanDTO(p)),
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to fetch plans",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getPlanById(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const plan = await this._subscriptionService.getPlanById(req.params.id);
			return successResponse(
				res,
				"Plan fetched successfully",
				subscriptionPlanDTO(plan),
			);
		} catch (error) {
			next(error);
			const msg = error instanceof Error ? error.message : "Unknown error";
			return errorResponse(
				res,
				msg,
				msg.includes("not found")
					? HttpStatus.NOT_FOUND
					: HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async createPlan(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const parsed = createPlanSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { name, description, price, durationDays, vehicleLimit, features } =
				parsed.data;

			const plan = await this._subscriptionService.createPlan({
				name,
				description,
				price,
				durationDays,
				vehicleLimit,
				features,
			});
			return successResponse(
				res,
				"Subscription plan created successfully",
				subscriptionPlanDTO(plan),
				HttpStatus.CREATED,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to create plan",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async updatePlan(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const parsed = updatePlanSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const plan = await this._subscriptionService.updatePlan(
				req.params.id,
				parsed.data,
			);
			return successResponse(
				res,
				"Subscription plan updated successfully",
				subscriptionPlanDTO(plan),
			);
		} catch (error) {
			next(error);
			const msg = error instanceof Error ? error.message : "Unknown error";
			return errorResponse(
				res,
				msg,
				msg.includes("not found")
					? HttpStatus.NOT_FOUND
					: HttpStatus.BAD_REQUEST,
			);
		}
	}

	async togglePlanStatus(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const plan = await this._subscriptionService.togglePlanStatus(
				req.params.id,
			);
			return successResponse(
				res,
				"Plan status updated",
				subscriptionPlanDTO(plan),
			);
		} catch (error) {
			next(error);
			const msg = error instanceof Error ? error.message : "Unknown error";
			return errorResponse(
				res,
				msg,
				msg.includes("not found")
					? HttpStatus.NOT_FOUND
					: HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getAllUserSubscriptions(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const search = req.query.search as string | undefined;
			const status = req.query.status as string | undefined;
			const result = await this._subscriptionService.getAllUserSubscriptions(
				page,
				limit,
				search,
				status,
			);
			const mappedResult = {
				...result,
				data: result.data.map((sub: IUserSubscription) =>
					userSubscriptionDTO(sub),
				),
			};
			return successResponse(
				res,
				"User subscriptions fetched successfully",
				mappedResult,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error
					? error.message
					: "Failed to fetch subscriptions",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async assignSubscription(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const parsed = assignSubscriptionSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { userId, planId } = parsed.data;
			const sub = await this._subscriptionService.assignSubscription(
				userId,
				planId,
			);
			return successResponse(
				res,
				"Subscription assigned successfully",
				userSubscriptionDTO(sub),
				HttpStatus.CREATED,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error
					? error.message
					: "Failed to assign subscription",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async cancelUserSubscription(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const parsed = reasonSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { reason } = parsed.data;
			const sub = await this._subscriptionService.cancelUserSubscription(
				req.params.id,
				reason,
			);
			return successResponse(
				res,
				"Subscription cancelled successfully",
				userSubscriptionDTO(sub),
			);
		} catch (error) {
			next(error);
			const msg = error instanceof Error ? error.message : "Unknown error";
			return errorResponse(
				res,
				msg,
				msg.includes("not found")
					? HttpStatus.NOT_FOUND
					: HttpStatus.BAD_REQUEST,
			);
		}
	}

	async getMySubscription(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const sub = await this._subscriptionService.getMySubscription(userId);
			return successResponse(
				res,
				"Subscription fetched successfully",
				sub ? userSubscriptionDTO(sub) : null,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to fetch subscription",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getMySubscriptionHistory(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const result = await this._subscriptionService.getMySubscriptionHistory(
				userId,
				page,
				limit,
			);
			const mappedResult = {
				...result,
				data: result.data.map((sub: IUserSubscription) =>
					userSubscriptionDTO(sub),
				),
			};
			return successResponse(res, "Subscription history fetched", mappedResult);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to fetch history",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async selfSubscribe(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const parsed = planIdSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { planId } = parsed.data;

			const existing =
				await this._subscriptionService.getMySubscription(userId);
			if (existing) {
				return errorResponse(
					res,
					"You already have an active subscription. Please contact admin to change your plan.",
					HttpStatus.CONFLICT,
				);
			}

			const sub = await this._subscriptionService.assignSubscription(
				userId,
				planId,
			);
			return successResponse(
				res,
				"Subscription activated successfully",
				userSubscriptionDTO(sub),
				HttpStatus.CREATED,
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to subscribe",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async createSubscriptionPaymentIntent(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const parsed = planIdSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { planId } = parsed.data;
			const result =
				await this._subscriptionService.createSubscriptionPaymentIntent(
					userId,
					planId,
				);
			return successResponse(res, "Payment intent created", result);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error
					? error.message
					: "Failed to create payment intent",
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async verifySubscriptionPayment(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				return errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
			}
			const parsed = verifyPaymentIntentSchema.safeParse(req.body);
			if (!parsed.success) {
				return errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
			}
			const { paymentIntentId } = parsed.data;
			const result = await this._subscriptionService.verifySubscriptionPayment(
				userId,
				paymentIntentId,
			);
			return successResponse(
				res,
				"Subscription activated successfully",
				userSubscriptionDTO(result),
			);
		} catch (error) {
			next(error);
			return errorResponse(
				res,
				error instanceof Error ? error.message : "Failed to verify payment",
				HttpStatus.BAD_REQUEST,
			);
		}
	}
}
