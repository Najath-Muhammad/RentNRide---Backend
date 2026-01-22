import type { BookingRepo } from "../../repositories/Implementation/booking.repository";
import type { IBooking } from "../../types/booking/booking.types";
import type { IAdminBookingService } from "../Interfaces/admin.booking.interface.service";

export class AdminBookingService implements IAdminBookingService {
	constructor(private bookingRepo: BookingRepo) {}

	async getAllBookings(
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
	}> {
		try {
			return await this.bookingRepo.findAllBookings(
				page,
				limit,
				status,
				search,
			);
		} catch (error) {
			console.error("Error in AdminBookingService.getAllBookings:", error);
			throw error;
		}
	}

	async cancelBooking(
		bookingId: string,
		reason?: string,
	): Promise<IBooking | null> {
		try {
			return await this.bookingRepo.cancelBooking(bookingId, "system", reason);
		} catch (error) {
			console.error("Error in AdminBookingService.cancelBooking:", error);
			throw error;
		}
	}
}
