import mongoose, { type FilterQuery } from "mongoose";
import { USER_ROLES } from "../../constants/roles";
import type { IUserRepository } from "../../repositories/interfaces/user.interface";
import type { IUser } from "../../types/user/IUser";
import type { IUserToAdmin } from "../../types/user/IUserToAdmin";
import { adminUserDTO } from "../../utils/mapper/adminService.mapper";
import { emitToUser } from "../../utils/socket";
import type { IAdminService } from "../interfaces/admin.interface.service";

export class AdminServices implements IAdminService {
	constructor(private _userRepo: IUserRepository) {}

	async getDashboardStats(query?: { startDate?: string; endDate?: string }) {
		try {
			const User = mongoose.model("User");
			const Vehicle = mongoose.model("Vehicle");
			const Booking = mongoose.model("Booking");
			const UserSubscription = mongoose.model("UserSubscription");

			const now = new Date();
			let startDateFilter: Date;
			let endDateFilter: Date = now;

			if (query?.startDate) {
				startDateFilter = new Date(query.startDate);
				startDateFilter.setHours(0, 0, 0, 0);
			} else {
				startDateFilter = new Date();
				startDateFilter.setDate(now.getDate() - 30);
				startDateFilter.setHours(0, 0, 0, 0);
			}

			if (query?.endDate) {
				endDateFilter = new Date(query.endDate);
				endDateFilter.setHours(23, 59, 59, 999);
			}

			const dateQuery = {
				createdAt: { $gte: startDateFilter, $lte: endDateFilter },
			};

			const [
				totalUsers,
				totalVehicles,
				totalBookings,
				availableVehicles,
				activeBookings,
				bookingStatusStats,
				revenueStats,
				bookingsTrendStats,
				revenueTrendStats,
				vehicleUsageStats,
				recentBookingsRaw,
			] = await Promise.all([
				User.countDocuments({ role: { $in: USER_ROLES }, ...dateQuery }),
				Vehicle.countDocuments({ ...dateQuery }),
				Booking.countDocuments({ ...dateQuery }),
				Vehicle.countDocuments({
					isActive: true,
					isApproved: true,
					isBlocked: false,
				}),
				Booking.countDocuments({
					bookingStatus: {
						$in: ["approved", "advance_authorized", "ride_started"],
					},
				}),
				Booking.aggregate([
					{ $match: dateQuery },
					{
						$group: {
							_id: "$bookingStatus",
							count: { $sum: 1 },
						},
					},
				]),
				UserSubscription.aggregate([
					{ $match: dateQuery },
					{
						$group: {
							_id: null,
							totalRevenue: { $sum: "$amountPaid" },
						},
					},
				]),
				Booking.aggregate([
					{ $match: dateQuery },
					{
						$group: {
							_id: {
								$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
							},
							count: { $sum: 1 },
						},
					},
					{ $sort: { _id: 1 } },
				]),
				UserSubscription.aggregate([
					{ $match: dateQuery },
					{
						$group: {
							_id: {
								$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
							},
							amount: { $sum: "$amountPaid" },
						},
					},
					{ $sort: { _id: 1 } },
				]),
				Booking.aggregate([
					{ $match: dateQuery },
					{
						$group: {
							_id: "$vehicleId",
							count: { $sum: 1 },
						},
					},
					{ $sort: { count: -1 } },
					{ $limit: 4 },
					{
						$lookup: {
							from: "vehicles",
							localField: "_id",
							foreignField: "_id",
							as: "vehicle",
						},
					},
					{ $unwind: "$vehicle" },
					{
						$project: {
							name: { $concat: ["$vehicle.brand", " ", "$vehicle.modelName"] },
							count: 1,
							_id: 0,
						},
					},
				]),
				Booking.find()
					.sort({ createdAt: -1 })
					.limit(5)
					.populate("userId", "name")
					.populate("vehicleId", "brand modelName")
					.lean(),
			]);

			// Format booking status object
			let completedCount = 0;
			let pendingCount = 0;
			let cancelledCount = 0;

			bookingStatusStats.forEach((stat: { _id: string; count: number }) => {
				if (["completed", "payment_captured"].includes(stat._id))
					completedCount += stat.count;
				else if (
					["requested", "pending", "approved", "advance_authorized"].includes(
						stat._id,
					)
				)
					pendingCount += stat.count;
				else if (["cancelled", "rejected"].includes(stat._id))
					cancelledCount += stat.count;
			});

			const totalRevenue =
				revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

			const bookingsTrend = bookingsTrendStats.map(
				(item: { _id: string; count: number }) => ({
					date: item._id,
					count: item.count,
				}),
			);

			const revenueTrend = revenueTrendStats.map(
				(item: { _id: string; amount: number }) => ({
					date: item._id,
					amount: item.amount,
				}),
			);

			// Format recent bookings
			const recentBookings = (recentBookingsRaw as unknown[]).map(
				(rawBooking: unknown) => {
					const booking = rawBooking as {
						_id: string;
						userId: { name: string };
						vehicleId: { brand: string; modelName: string };
						createdAt: string;
						bookingStatus: string;
						paymentStatus: string;
					};
					const user = booking.userId;
					const vehicle = booking.vehicleId;
					return {
						_id: booking._id.toString(),
						userName: user ? user.name : "Unknown User",
						vehicleName: vehicle
							? `${vehicle.brand} ${vehicle.modelName}`
							: "Unknown Vehicle",
						date: booking.createdAt,
						status: booking.bookingStatus,
						paymentStatus: booking.paymentStatus,
					};
				},
			);

			return {
				success: true,
				data: {
					totalUsers,
					totalVehicles,
					totalBookings,
					totalRevenue,
					activeBookings,
					availableVehicles,
					bookingsTrend,
					revenueTrend,
					vehicleUsage: vehicleUsageStats,
					bookingStatus: {
						completed: completedCount,
						pending: pendingCount,
						cancelled: cancelledCount,
					},
					recentBookings,
				},
			};
		} catch (error) {
			console.error("Error in admin dashboard stats:", error);
			throw error;
		}
	}

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

			const filters: FilterQuery<IUser> = { role: { $in: USER_ROLES } };

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
		| { success: true; message: string; data?: IUserToAdmin | null }
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

			emitToUser(userId, "user:blocked", {
				message: "You have been blocked by the admin.",
			});

			return {
				success: true,
				message: "User blocked successfully",
				data: result ? adminUserDTO(result) : undefined,
			};
		} catch (error) {
			console.error("Block user service error:", error);
			return { success: false, message: "Failed to block user" };
		}
	}

	async unBlockUser(
		userId: string,
	): Promise<
		| { success: true; message: string; data?: IUserToAdmin | null }
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
				data: result ? adminUserDTO(result) : undefined,
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

			await this._userRepo.deleteById(userId);

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
