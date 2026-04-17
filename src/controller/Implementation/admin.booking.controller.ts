import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IAdminBookingService } from "../../services/interfaces/admin.booking.interface.service";
import type { IBooking } from "../../types/booking/booking.types";
import { bookingDTO } from "../../utils/mapper/booking.mapper";
import { errorResponse, successResponse } from "../../utils/response.util";
import { reasonSchema } from "../../validations/commonValidation";
import type { IAdminBookingController } from "../interfaces/iadmin.booking.controller";

export class AdminBookingController implements IAdminBookingController {
	constructor(private adminBookingService: IAdminBookingService) {}

	async getAllBookings(req: Request, res: Response): Promise<void> {
		try {
			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const status = req.query.status as string;
			const search = req.query.search as string;

			const result = await this.adminBookingService.getAllBookings(
				page,
				limit,
				status,
				search,
			);

			const mappedResult = {
				...result,
				data: result.data.map((b) => bookingDTO(b as IBooking)),
			};
			successResponse(res, "All bookings fetched successfully", mappedResult);
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
			const parsed = reasonSchema.safeParse(req.body);
			if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
			const { reason } = parsed.data;

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

			successResponse(
				res,
				"Booking cancelled successfully",
				bookingDTO(booking as IBooking),
			);
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
