import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IBookingService } from "../../services/Interfaces/booking.interface.service";
import { errorResponse, successResponse } from "../../utils/response.util";
import type { IBookingController } from "../interfaces/ibooking.controller";

export class BookingController implements IBookingController {
	constructor(private _bookingService: IBookingService) {}

	async createBooking(req: Request, res: Response): Promise<void> {
		try {
			console.log("Booking controller reached");

			const user = (req as Request & { user?: { userId: string } }).user;
			const userId = user?.userId;

			if (!userId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

			const bookingData = req.body;
			const booking = await this._bookingService.createBooking(
				userId,
				bookingData,
			);

			successResponse(
				res,
				"Booking created successfully. Awaiting owner confirmation.",
				{
					bookingId: booking.bookingId,
					totalAmount: booking.totalAmount,
					advancePaid: booking.advancePaid,
					status: booking.bookingStatus,
				},
			);
		} catch (error) {
			console.error("Error in createBooking controller:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getUserBookings(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as Request & { user?: { userId: string } }).user;
			const userId = user?.userId;

			if (!userId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const status = req.query.status as string;

			const result = await this._bookingService.getUserBookings(
				userId,
				page,
				limit,
				status,
			);

			successResponse(res, "User bookings fetched successfully", result);
		} catch (error) {
			console.error("Error in getUserBookings controller:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async cancelBooking(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as Request & { user?: { userId: string } }).user;
			const userId = user?.userId;
			const { bookingId } = req.params;
			const { reason } = req.body;

			if (!userId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

			const booking = await this._bookingService.cancelBooking(
				bookingId,
				userId,
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
			console.error("Error in cancelBooking controller:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
