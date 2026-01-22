import type { Request, Response } from "express";

export interface IReviewController {
	createReview(req: Request, res: Response): Promise<void>;
	getVehicleReviews(req: Request, res: Response): Promise<void>;
	checkReviewEligibility(req: Request, res: Response): Promise<void>;
}
