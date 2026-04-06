import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { ISubscriptionService } from "../../services/interfaces/subscription.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";

export class SubscriptionController {
	constructor(private _subscriptionService: ISubscriptionService) {}

	async getAllPlans(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<Response> {
		try {
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 10;
			const search = req.query.search as string | undefined;
			const result = await this._subscriptionService.getAllPlans(
				page,
				limit,
				search,
			);
			return successResponse(
				res,
				"Subscription plans fetched successfully",
				result,
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
			return successResponse(res, "Active plans fetched successfully", plans);
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
			return successResponse(res, "Plan fetched successfully", plan);
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
			const { name, description, price, durationDays, vehicleLimit, features } =
				req.body;
			if (!name?.trim()) {
				return errorResponse(
					res,
					"Plan name is required",
					HttpStatus.BAD_REQUEST,
				);
			}
			if (price === undefined || price < 0) {
				return errorResponse(
					res,
					"Valid price is required",
					HttpStatus.BAD_REQUEST,
				);
			}
			if (!durationDays || durationDays < 1) {
				return errorResponse(
					res,
					"Valid duration is required",
					HttpStatus.BAD_REQUEST,
				);
			}
			if (!vehicleLimit || vehicleLimit < 1) {
				return errorResponse(
					res,
					"Valid vehicle limit is required",
					HttpStatus.BAD_REQUEST,
				);
			}
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
				plan,
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
			const plan = await this._subscriptionService.updatePlan(
				req.params.id,
				req.body,
			);
			return successResponse(
				res,
				"Subscription plan updated successfully",
				plan,
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
			return successResponse(res, "Plan status updated", plan);
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
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 10;
			const search = req.query.search as string | undefined;
			const status = req.query.status as string | undefined;
			const result = await this._subscriptionService.getAllUserSubscriptions(
				page,
				limit,
				search,
				status,
			);
			return successResponse(
				res,
				"User subscriptions fetched successfully",
				result,
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
			const { userId, planId } = req.body;
			if (!userId || !planId) {
				return errorResponse(
					res,
					"userId and planId are required",
					HttpStatus.BAD_REQUEST,
				);
			}
			const sub = await this._subscriptionService.assignSubscription(
				userId,
				planId,
			);
			return successResponse(
				res,
				"Subscription assigned successfully",
				sub,
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
			const { reason } = req.body;
			const sub = await this._subscriptionService.cancelUserSubscription(
				req.params.id,
				reason,
			);
			return successResponse(res, "Subscription cancelled successfully", sub);
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
			return successResponse(res, "Subscription fetched successfully", sub);
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
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 10;
			const result = await this._subscriptionService.getMySubscriptionHistory(
				userId,
				page,
				limit,
			);
			return successResponse(res, "Subscription history fetched", result);
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
			const { planId } = req.body;
			if (!planId) {
				return errorResponse(res, "planId is required", HttpStatus.BAD_REQUEST);
			}

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
				sub,
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
			const { planId } = req.body;
			if (!planId) {
				return errorResponse(res, "planId is required", HttpStatus.BAD_REQUEST);
			}
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
			const { paymentIntentId } = req.body;
			if (!paymentIntentId) {
				return errorResponse(
					res,
					"paymentIntentId is required",
					HttpStatus.BAD_REQUEST,
				);
			}
			const result = await this._subscriptionService.verifySubscriptionPayment(
				userId,
				paymentIntentId,
			);
			return successResponse(
				res,
				"Subscription activated successfully",
				result,
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
