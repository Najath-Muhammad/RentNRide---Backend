import type { IReview } from "../../model/review.model";
import type { IBaseRepo } from "./base.interface";

export interface IReviewRepository extends IBaseRepo<IReview> {
	findByVehicleId(vehicleId: string): Promise<IReview[]>;
	findByUserId(userId: string): Promise<IReview[]>;
}
