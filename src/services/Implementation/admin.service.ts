import type { FilterQuery } from "mongoose";
import type { IUserRepository } from "../../repositories/interfaces/user.interface";
import type { IUser } from "../../types/user/IUser";
import type { IUserToAdmin } from "../../types/user/IUserToAdmin";
import { adminUserDTO } from "../../utils/mapper/adminService.mapper";
import type { IAdminService } from "../Interfaces/admin.interface.service";

export class AdminServices implements IAdminService {
	constructor(private _userRepo: IUserRepository) {}

	async getAllUsers(query: {
		page?: number | string;
		limit?: number | string;
		search?: string;
		status?: string;
	}): Promise<
		| {
				success: true;
				message?: string;
				data: {
					users: IUserToAdmin[];
					total: number;
					page: number;
					limit: number;
					totalPages: number;
				};
		  }
		| {
				success: false;
				message: string;
				data: IUserToAdmin[];
		  }
	> {
		try {
			const page = Number(query.page) || 1;
			const limit = Number(query.limit) || 10;
			const { search, status } = query;

			const filters: FilterQuery<IUser> = { role: "user" };

			if (search) {
				filters.$or = [
					{ name: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
				];
			}
			if (status) filters.status = status;
			const repoResult = await this._userRepo.findAllUsers(
				filters,
				page,
				limit,
			);
			return {
				success: true,
				data: {
					users: repoResult.data.map((user) => adminUserDTO(user)),
					total: repoResult.total,
					page: repoResult.page,
					limit: repoResult.limit,
					totalPages: repoResult.totalPages,
				},
			};
		} catch (error) {
			console.error("Get all users service error:", error);
			return {
				success: false,
				message: "Failed to fetch users",
				data: [],
			};
		}
	}

	async blockUser(
		userId: string,
	): Promise<
		| { success: true; message: string; data?: IUser | null }
		| { success: false; message: string }
	> {
		try {
			const user = await this._userRepo.findById(userId);
			if (!user) {
				return { success: false, message: "User not found" };
			}

			const result = await this._userRepo.updateById(userId, {
				status: "Blocked",
				isBlocked: true,
			});

			return {
				success: true,
				message: "User blocked successfully",
				data: result ?? undefined,
			};
		} catch (error) {
			console.error("Block user service error:", error);
			return { success: false, message: "Failed to block user" };
		}
	}

	async unBlockUser(
		userId: string,
	): Promise<
		| { success: true; message: string; data?: IUser | null }
		| { success: false; message: string }
	> {
		try {
			const user = await this._userRepo.findById(userId);
			if (!user) {
				return { success: false, message: "User not found" };
			}

			const result = await this._userRepo.updateById(userId, {
				status: "Active",
				isBlocked: false,
			});

			return {
				success: true,
				message: "User unblocked successfully",
				data: result ?? undefined,
			};
		} catch (error) {
			console.error("Unblock user service error:", error);
			return { success: false, message: "Failed to unblock user" };
		}
	}

	async deleteUser(
		userId: string,
	): Promise<
		| { success: true; message: string; data?: undefined }
		| { success: false; message: string }
	> {
		try {
			const user = await this._userRepo.findById(userId);
			if (!user) {
				return { success: false, message: "User not found" };
			}

			const result = await this._userRepo.deleteById(userId);

			return {
				success: true,
				message: "User deleted successfully",
			};
		} catch (error) {
			console.error("Delete user service error:", error);
			return { success: false, message: "Failed to delete user" };
		}
	}
}
