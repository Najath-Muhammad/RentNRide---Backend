import type { FilterQuery } from "mongoose";
import type { IUserRepository } from "../../repositories/interfaces/user.interface";
import type { IUser } from "../../types/user/IUser";
import type { IUserToAdmin } from "../../types/user/IUserToAdmin";
import { adminUserDTO } from "../../utils/mapper/adminService.mapper";
import type { IAdminService } from "../Interfaces/admin.interface.service";

export class AdminServices implements IAdminService {
	constructor(private _userRepo: IUserRepository) { }

	async getDashboardStats() {
		try {
			// Using the injected UserRepo. To access other models natively via mongoose,
			// we can use mongoose.model directly, or inject those repos as well. 
			// For simplicity since admin service is used globally, we'll query mongoose models directly for Stats.
			const mongoose = require('mongoose');

			const User = mongoose.model('User');
			const Vehicle = mongoose.model('Vehicle');
			const Booking = mongoose.model('Booking');

			const now = new Date();
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(now.getDate() - 30);

			// Run all expensive aggregations and queries in parallel
			const [
				totalUsers,
				totalVehicles,
				totalBookings,
				availableVehicles,
				activeBookings,
				bookingStatusStats,
				revenueStats,
				bookingsTrendStats,
				vehicleUsageStats,
				recentBookingsRaw
			] = await Promise.all([
				User.countDocuments({ role: 'user' }),
				Vehicle.countDocuments(),
				Booking.countDocuments(),
				Vehicle.countDocuments({ isActive: true, isApproved: true, isBlocked: false }),
				Booking.countDocuments({ bookingStatus: { $in: ['approved', 'advance_authorized', 'ride_started'] } }),
				Booking.aggregate([
					{
						$group: {
							_id: "$bookingStatus",
							count: { $sum: 1 }
						}
					}
				]),
				Booking.aggregate([
					{ $match: { bookingStatus: { $in: ['completed', 'payment_captured'] } } },
					{
						$group: {
							_id: null,
							totalRevenue: { $sum: "$totalAmount" }
						}
					}
				]),
				Booking.aggregate([
					{ $match: { createdAt: { $gte: thirtyDaysAgo } } },
					{
						$group: {
							_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
							count: { $sum: 1 },
							amount: {
								$sum: {
									$cond: [
										{ $in: ["$bookingStatus", ["completed", "payment_captured"]] },
										"$totalAmount",
										0
									]
								}
							}
						}
					},
					{ $sort: { "_id": 1 } }
				]),
				Booking.aggregate([
					{
						$group: {
							_id: "$vehicleId",
							count: { $sum: 1 }
						}
					},
					{ $sort: { count: -1 } },
					{ $limit: 4 },
					{
						$lookup: {
							from: 'vehicles',
							localField: '_id',
							foreignField: '_id',
							as: 'vehicle'
						}
					},
					{ $unwind: "$vehicle" },
					{
						$project: {
							name: { $concat: ["$vehicle.brand", " ", "$vehicle.modelName"] },
							count: 1,
							_id: 0
						}
					}
				]),
				Booking.find()
					.sort({ createdAt: -1 })
					.limit(5)
					.populate('userId', 'name')
					.populate('vehicleId', 'brand modelName')
					.lean()
			]);

			// Format booking status object
			let completedCount = 0;
			let pendingCount = 0;
			let cancelledCount = 0;

			bookingStatusStats.forEach((stat: any) => {
				if (['completed', 'payment_captured'].includes(stat._id)) completedCount += stat.count;
				else if (['requested', 'pending', 'approved', 'advance_authorized'].includes(stat._id)) pendingCount += stat.count;
				else if (['cancelled', 'rejected'].includes(stat._id)) cancelledCount += stat.count;
			});

			const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

			// Format trends, ensure they have valid entries
			const bookingsTrend = bookingsTrendStats.map((item: any) => ({
				date: item._id,
				count: item.count
			}));

			const revenueTrend = bookingsTrendStats.map((item: any) => ({
				date: item._id,
				amount: item.amount
			}));

			// Format recent bookings
			const recentBookings = recentBookingsRaw.map((booking: any) => {
				const user = booking.userId as any;
				const vehicle = booking.vehicleId as any;
				return {
					_id: booking._id.toString(),
					userName: user ? user.name : 'Unknown User',
					vehicleName: vehicle ? `${vehicle.brand} ${vehicle.modelName}` : 'Unknown Vehicle',
					date: booking.createdAt,
					status: booking.bookingStatus,
					paymentStatus: booking.paymentStatus
				};
			});

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
						cancelled: cancelledCount
					},
					recentBookings
				}
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
