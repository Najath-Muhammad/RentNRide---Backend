import type { Document, FilterQuery } from "mongoose";
import { UserModel } from "../../model/user.model";
import type { IUser } from "../../types/user/IUser";
import { BaseRepo } from "./base.repository";

export class UserRepo extends BaseRepo<Document & IUser> {
	constructor() {
		super(UserModel);
	}

	async findAllUsers(filters: FilterQuery<IUser>, page: number, limit: number) {
		const skip = (page - 1) * limit;

		const data = await this.model
			.find(filters)
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 });

		const total = await this.model.countDocuments(filters);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findByEmail(email: string): Promise<IUser | null> {
		return await this.model.findOne({ email: email });
	}

	async findByEmailAndUpdate(
		email: string,
		password: string,
	): Promise<IUser | null> {
		try {
			const updatedUser = await this.model.findOneAndUpdate(
				{ email },
				{ password },
				{ new: true },
			);
			return updatedUser;
		} catch (error) {
			console.error("Error updating user password:", error);
			throw new Error("Failed to update user password");
		}
	}

	async findByIdWithPassword(id: string): Promise<(IUser & Document) | null> {
		return await this.model.findById(id).select("+password");
	}

	async findByIdSub(userId: string): Promise<(IUser & Document) | null> {
		return await this.model.findById(userId).select("_id name email role premiumExpiresAt");
	}

	/** Add an FCM token (prevents duplicates via $addToSet) */
	async addFcmToken(userId: string, token: string): Promise<void> {
		await this.model.findByIdAndUpdate(userId, {
			$addToSet: { fcmTokens: token },
		});
	}

	/** Remove a specific FCM token (called on logout or token refresh) */
	async removeFcmToken(userId: string, token: string): Promise<void> {
		await this.model.findByIdAndUpdate(userId, {
			$pull: { fcmTokens: token },
		});
	}
}
