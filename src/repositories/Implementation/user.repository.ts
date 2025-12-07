import type { Document } from "mongoose";
import { UserModel } from "../../model/User/user.model";
import type { IUser } from "../../types/user/IUser";
import { BaseRepo } from "./base.repository";

export class UserRepo extends BaseRepo<Document & IUser> {
	constructor() {
		super(UserModel);
	}

	async findAllUsers(filters: any, page: number, limit: number) {
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
}
