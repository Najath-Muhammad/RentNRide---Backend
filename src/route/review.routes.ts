import { Router } from "express";
import { ALL_ROLES } from "../constants/roles";
import { ReviewController } from "../controller/Implementation/review.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { BookingRepo } from "../repositories/Implementation/booking.repository";
import { ReviewRepo } from "../repositories/Implementation/review.repository";
import { ReviewService } from "../services/Implementation/review.service";

const reviewRouter = Router();

const reviewRepo = new ReviewRepo();
const bookingRepo = new BookingRepo();
const reviewService = new ReviewService(reviewRepo, bookingRepo);
const reviewController = new ReviewController(reviewService);

reviewRouter.post(
	"/",
	AuthGuard(ALL_ROLES),
	reviewController.createReview.bind(reviewController),
);
reviewRouter.get(
	"/vehicle/:vehicleId",
	reviewController.getVehicleReviews.bind(reviewController),
);
reviewRouter.get(
	"/eligibility/:vehicleId",
	AuthGuard(ALL_ROLES),
	reviewController.checkReviewEligibility.bind(reviewController),
);

export default reviewRouter;
