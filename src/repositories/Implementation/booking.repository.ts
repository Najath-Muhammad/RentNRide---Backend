import type { FilterQuery, Types } from "mongoose";
import { BookingModel } from "../../model/booking.model";
import type { IBooking } from "../../types/booking/booking.types";
import type { IBookingRepo } from "../interfaces/booking.interface";
import { BaseRepo } from "./base.repository";

export class BookingRepo extends BaseRepo<IBooking> implements IBookingRepo {
	constructor() {
		super(BookingModel);
	}

	async findBookingsByUser(
		userId: string | Types.ObjectId,
		page: number = 1,
		limit: number = 10,
		status?: IBooking["bookingStatus"],
	) {
		const skip = (page - 1) * limit;

		const filter: FilterQuery<IBooking> = { userId };

		if (status) {
			filter.bookingStatus = status;
		}

		const bookings = await this.model
			.find(filter)
			.populate("vehicleId", "brand modelName vehicleId vehicleImages")
			.populate("ownerId", "name email")
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
			.exec();

		const total = await this.model.countDocuments(filter).exec();

		return {
			data: bookings,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findBookingsByOwner(
		ownerId: string | Types.ObjectId,
		page: number = 1,
		limit: number = 10,
		status?: IBooking["bookingStatus"],
	) {
		const skip = (page - 1) * limit;

		const filter: FilterQuery<IBooking> = { ownerId };

		if (status) {
			filter.bookingStatus = status;
		}

		const bookings = await this.model
			.find(filter)
			.populate("vehicleId", "brand modelName vehicleId")
			.populate("userId", "name email")
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
			.exec();

		const total = await this.model.countDocuments(filter).exec();

		return {
			data: bookings,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findActiveBookingsForVehicle(
		vehicleId: string | Types.ObjectId,
		startDate?: Date,
		endDate?: Date,
	): Promise<IBooking[]> {
		const filter: FilterQuery<IBooking> = {
			vehicleId,
			bookingStatus: {
				$in: [
					"requested",
					"approved",
					"advance_authorized",
					"ride_started",
					"payment_captured",
				],
			},
		};

		if (startDate && endDate) {
			filter.$or = [
				{ startDate: { $lt: endDate }, endDate: { $gt: startDate } },
				{ startDate: { $gte: startDate }, endDate: { $lte: endDate } },
			];
		}

		return await this.model.find(filter).sort({ startDate: 1 }).exec();
	}

	async getBookingStats() {
		try {
			const totalBookings = await this.model.countDocuments().exec();

			const [
				requested,
				approved,
				advance_authorized,
				ride_started,
				payment_captured,
				completed,
				cancelled,
				refunded,
			] = await Promise.all([
				this.model.countDocuments({ bookingStatus: "requested" }).exec(),
				this.model.countDocuments({ bookingStatus: "approved" }).exec(),
				this.model
					.countDocuments({ bookingStatus: "advance_authorized" })
					.exec(),
				this.model.countDocuments({ bookingStatus: "ride_started" }).exec(),
				this.model.countDocuments({ bookingStatus: "payment_captured" }).exec(),
				this.model.countDocuments({ bookingStatus: "completed" }).exec(),
				this.model.countDocuments({ bookingStatus: "cancelled" }).exec(),
				this.model.countDocuments({ paymentStatus: "refunded" }).exec(),
			]);

			return {
				totalBookings,
				requested,
				approved,
				advance_authorized,
				ride_started,
				payment_captured,
				completed,
				cancelled,
				refunded,
			};
		} catch (error) {
			console.error("Error in getBookingStats:", error);
			return {
				totalBookings: 0,
				requested: 0,
				approved: 0,
				advance_authorized: 0,
				ride_started: 0,
				payment_captured: 0,
				completed: 0,
				cancelled: 0,
				refunded: 0,
			};
		}
	}

	async cancelBooking(
		bookingId: string | Types.ObjectId,
		cancelledBy: "user" | "owner" | "system",
		reason?: string,
	): Promise<IBooking | null> {
		const update: Partial<IBooking> = {
			bookingStatus: "cancelled",
			cancelledBy,
			cancellationReason: reason?.trim() || undefined,
		};

		return await this.model
			.findByIdAndUpdate(bookingId, update, { new: true })
			.exec();
	}

	async findCompletedBooking(
		userId: string | Types.ObjectId,
		vehicleId: string | Types.ObjectId,
	): Promise<IBooking | null> {
		return await this.model
			.findOne({
				userId,
				vehicleId,
				bookingStatus: {
					$in: ["completed", "ride_started", "payment_captured"],
				},
			})
			.exec();
	}

	async findAllBookings(
		page: number = 1,
		limit: number = 10,
		status?: string,
		search?: string,
	) {
		const skip = (page - 1) * limit;
		const filter: FilterQuery<IBooking> = {};

		if (status) {
			filter.bookingStatus = status;
		}

		if (search) {
			filter.$or = [{ bookingId: { $regex: search, $options: "i" } }];
		}

		const bookings = await this.model
			.find(filter)
			.populate("vehicleId", "brand modelName vehicleId vehicleImages")
			.populate("ownerId", "name email")
			.populate("userId", "name email")
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
			.exec();

		const total = await this.model.countDocuments(filter).exec();

		return {
			data: bookings,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}
	async expireStaleBookings(userId?: string | Types.ObjectId): Promise<number> {
		const now = new Date();
		const filter: FilterQuery<IBooking> = {
			bookingStatus: { $in: ["requested", "approved", "advance_authorized"] },
			endDate: { $lt: now },
		};
		if (userId) {
			filter.userId = userId;
		}
		const result = await this.model
			.updateMany(filter, {
				$set: {
					bookingStatus: "cancelled",
					cancelledBy: "system",
					cancellationReason:
						"Booking expired — end date passed without confirmation.",
				},
			})
			.exec();
		return result.modifiedCount;
	}

	async updateBookingDetails(
		bookingId: string | Types.ObjectId,
		updateData: Partial<IBooking>,
	): Promise<IBooking | null> {
		return await this.model
			.findByIdAndUpdate(bookingId, { $set: updateData }, { new: true })
			.exec();
	}
}
