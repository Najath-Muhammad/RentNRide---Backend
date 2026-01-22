import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IReviewService } from "../../services/Interfaces/review.service.interface";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IReviewController } from "../interfaces/ireview.controller";

export class ReviewController implements IReviewController {
	constructor(private _reviewService: IReviewService) {}

	async createReview(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as Request & { user?: { userId: string } }).user;
			const userId = user?.userId;
			const { vehicleId, bookingId, rating, comment } = req.body;

			if (!userId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

			const review = await this._reviewService.createReview(
				userId,
				vehicleId,
				bookingId,
				rating,
				comment,
			);

			successResponse(res, "Review submitted successfully", review);
		} catch (error) {
			console.error("Error in createReview:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getVehicleReviews(req: Request, res: Response): Promise<void> {
		try {
			const { vehicleId } = req.params;
			const reviews = await this._reviewService.getVehicleReviews(vehicleId);
			successResponse(res, "Reviews fetched successfully", reviews);
		} catch (error) {
			console.error("Error in getVehicleReviews:", error);
			errorResponse(
				res,
				"Failed to fetch reviews",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async checkReviewEligibility(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as Request & { user?: { userId: string } }).user;
			const userId = user?.userId;
			const { vehicleId } = req.params;

			if (!userId) {
				successResponse(res, "Check complete", { canReview: false });
				return;
			}

			const result = await this._reviewService.canUserReview(userId, vehicleId);
			successResponse(res, "Check complete", result);
		} catch (error) {
			console.error("Error in checkReviewEligibility:", error);
			errorResponse(
				res,
				"Failed to check eligibility",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
