import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IAdminBookingService } from "../../services/Interfaces/admin.booking.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IAdminBookingController } from "../interfaces/iadmin.booking.controller";

export class AdminBookingController implements IAdminBookingController {
	constructor(private adminBookingService: IAdminBookingService) {}

	async getAllBookings(req: Request, res: Response): Promise<void> {
		try {
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 10;
			const status = req.query.status as string;
			const search = req.query.search as string;

			const result = await this.adminBookingService.getAllBookings(
				page,
				limit,
				status,
				search,
			);
			successResponse(res, "All bookings fetched successfully", result);
		} catch (error) {
			console.error("Error in AdminBookingController.getAllBookings:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async cancelBooking(req: Request, res: Response): Promise<void> {
		try {
			const { bookingId } = req.params;
			const { reason } = req.body;

			const booking = await this.adminBookingService.cancelBooking(
				bookingId,
				reason,
			);

			if (!booking) {
				errorResponse(
					res,
					"Booking not found or could not be cancelled",
					HttpStatus.NOT_FOUND,
				);
				return;
			}

			successResponse(res, "Booking cancelled successfully", booking);
		} catch (error) {
			console.error("Error in AdminBookingController.cancelBooking:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
