import type { IReview } from "../../model/review.model";

export interface IReviewService {
	createReview(
		userId: string,
		vehicleId: string,
		bookingId: string,
		rating: number,
		comment: string,
	): Promise<IReview>;

	getVehicleReviews(vehicleId: string): Promise<IReview[]>;

	canUserReview(
		userId: string,
		vehicleId: string,
	): Promise<{ canReview: boolean; bookingId?: string }>;
}
