import type { Types } from "mongoose";

import type {
	CreateBookingInput,
	IBooking,
} from "../../types/booking/booking.types";

export interface IBookingService {
	createBooking(
		userId: string | Types.ObjectId,
		data: CreateBookingInput,
	): Promise<IBooking>;

	getBookingById(
		bookingId: string,
		requesterId: string | Types.ObjectId,
		role: "user" | "owner" | "admin",
	): Promise<IBooking | null>;

	getUserBookings(
		userId: string | Types.ObjectId,
		page?: number,
		limit?: number,
		status?: string,
	): Promise<{
		data: IBooking[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;

	cancelBooking(
		bookingId: string,
		userId: string | Types.ObjectId,
		reason?: string,
	): Promise<IBooking | null>;
}
