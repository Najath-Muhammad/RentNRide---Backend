import type { IBooking } from "../../types/booking/booking.types";

export interface IAdminBookingService {
	getAllBookings(
		page: number,
		limit: number,
		status?: string,
		search?: string,
	): Promise<{
		data: IBooking[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;
	cancelBooking(bookingId: string, reason?: string): Promise<IBooking | null>;
}
