import type { IReview } from "../../model/review.model";
import type { BookingRepo } from "../../repositories/Implementation/booking.repository";
import type { ReviewRepo } from "../../repositories/Implementation/review.repository";
import type { IReviewService } from "../Interfaces/review.service.interface";

export class ReviewService implements IReviewService {
	constructor(
		private _reviewRepo: ReviewRepo,
		private _bookingRepo: BookingRepo,
	) {}

	async createReview(
		userId: string,
		vehicleId: string,
		bookingId: string,
		rating: number,
		comment: string,
	): Promise<IReview> {
		const existingReview = await this._reviewRepo.findOne({
			vehicleId,
			userId,
			bookingId,
		});
		if (existingReview) {
			throw new Error("You have already reviewed this booking.");
		}

		return await this._reviewRepo.create({
			userId: userId as any,
			vehicleId: vehicleId as any,
			bookingId: bookingId as any,
			rating,
			comment,
		});
	}

	async getVehicleReviews(vehicleId: string): Promise<IReview[]> {
		return await this._reviewRepo.findByVehicleId(vehicleId);
	}

	async canUserReview(
		userId: string,
		vehicleId: string,
	): Promise<{ canReview: boolean; bookingId?: string }> {
		const completedBooking = await this._bookingRepo.findCompletedBooking(
			userId,
			vehicleId,
		);

		if (!completedBooking) {
			return { canReview: false };
		}

		const existingReview = await this._reviewRepo.findOne({
			bookingId: completedBooking._id as any,
		});

		if (existingReview) {
			return { canReview: false };
		}

		return { canReview: true, bookingId: completedBooking._id.toString() };
	}
}
