import type { Types } from "mongoose";
import type { IBooking } from "../../types/booking/booking.types";

import type { IBaseRepo } from "./base.interface";

export interface IBookingRepo extends IBaseRepo<IBooking> {
	findBookingsByUser(
		userId: string | Types.ObjectId,
		page?: number,
		limit?: number,
		status?: IBooking["bookingStatus"],
	): Promise<{
		data: IBooking[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;

	findBookingsByOwner(
		ownerId: string | Types.ObjectId,
		page?: number,
		limit?: number,
		status?: IBooking["bookingStatus"],
	): Promise<{
		data: IBooking[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;

	findActiveBookingsForVehicle(
		vehicleId: string | Types.ObjectId,
		startDate?: Date,
		endDate?: Date,
	): Promise<IBooking[]>;

	getBookingStats(): Promise<{
		totalBookings: number;
		pending: number;
		confirmed: number;
		ongoing: number;
		completed: number;
		cancelled: number;
		refunded: number;
	}>;

	cancelBooking(
		bookingId: string | Types.ObjectId,
		cancelledBy: "user" | "owner" | "system",
		reason?: string,
	): Promise<IBooking | null>;

	findCompletedBooking(
		userId: string | Types.ObjectId,
		vehicleId: string | Types.ObjectId,
	): Promise<IBooking | null>;

	findAllBookings(
		page?: number,
		limit?: number,
		status?: string,
		search?: string,
	): Promise<{
		data: IBooking[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;
	expireStaleBookings(
		userId?: string | Types.ObjectId,
	): Promise<number>;
}
