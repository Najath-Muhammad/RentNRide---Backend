import { type IReview, ReviewModel } from "../../model/review.model";
import type { IReviewRepository } from "../interfaces/review.interface";
import { BaseRepo } from "./base.repository";

export class ReviewRepo extends BaseRepo<IReview> implements IReviewRepository {
	constructor() {
		super(ReviewModel);
	}

	async findByVehicleId(vehicleId: string): Promise<IReview[]> {
		return await this.model
			.find({ vehicleId })
			.populate("userId", "name email")
			.sort({ createdAt: -1 });
	}

	async findByUserId(userId: string): Promise<IReview[]> {
		return await this.model
			.find({ userId })
			.populate("vehicleId", "brand modelName")
			.sort({ createdAt: -1 });
	}
}
