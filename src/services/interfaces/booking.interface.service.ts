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

	getOwnerBookings(
		ownerId: string | Types.ObjectId,
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

	getOwnerDashboard(ownerId: string): Promise<{
		totalRevenue: number;
		totalBookings: number;
		totalCancelled: number;
		totalVehicles: number;
		activeVehicles: number;
		earningsThisMonth: number;
		pendingPayments: number;
	}>;

	returnVehicle(
		bookingId: string,
		requesterId: string | Types.ObjectId,
	): Promise<IBooking | null>;

	requestExtension(
		bookingId: string,
		userId: string | Types.ObjectId,
		newReturnDate: Date,
		reason?: string,
	): Promise<IBooking | null>;

	approveExtension(
		bookingId: string,
		ownerId: string | Types.ObjectId,
		approved: boolean,
	): Promise<IBooking | null>;

	getOverdueBookingsForOwner(ownerId: string | Types.ObjectId): Promise<IBooking[]>;
	getPendingExtensions(ownerId: string | Types.ObjectId): Promise<IBooking[]>;
	getRunningOvertimeFee(bookingId: string): Promise<{
		extraHours: number;
		extraDays: number;
		lateFee: number;
		isOverGrace: boolean;
	}>;
}
