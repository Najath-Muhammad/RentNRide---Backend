import type { Request, Response } from "express";
import { HttpStatus } from "../../constants/enum/statuscode";
import type { IBookingService } from "../../services/interfaces/booking.interface.service";
import type { IBooking } from "../../types/booking/booking.types";
import { bookingDTO } from "../../utils/mapper/booking.mapper";
import { errorResponse, successResponse } from "../../utils/response.util";
import {
	createBookingSchema,
	reasonSchema,
} from "../../validations/commonValidation";
import type { IBookingController } from "../interfaces/ibooking.controller";

export class BookingController implements IBookingController {
	constructor(private _bookingService: IBookingService) {}

	async createBooking(req: Request, res: Response): Promise<void> {
		try {
            const user = (req as Request & { user?: { userId: string } }).user;
            const userId = user?.userId;

            if (!userId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

            const parsed = createBookingSchema.safeParse(req.body);
            if (!parsed.success) {
				errorResponse(
					res,
					parsed.error.issues[0].message,
					HttpStatus.BAD_REQUEST,
				);
				return;
			}
            const bookingData = parsed.data;
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

			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const status = req.query.status as string;

			const result = await this._bookingService.getUserBookings(
				userId,
				page,
				limit,
				status,
			);

			const mappedResult = {
				...result,
				data: result.data.map((b: IBooking) => bookingDTO(b)),
			};

			successResponse(res, "User bookings fetched successfully", mappedResult);
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

			successResponse(
				res,
				"Booking cancelled successfully",
				bookingDTO(booking),
			);
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
