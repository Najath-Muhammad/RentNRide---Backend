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
			console.log("Booking controller reached");

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

	async getOwnerBookings(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as Request & { user?: { userId: string } }).user;
			const ownerId = user?.userId;

			if (!ownerId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

			const page = Number.parseInt(req.query.page as string, 10) || 1;
			const limit = Number.parseInt(req.query.limit as string, 10) || 10;
			const status = req.query.status as string;

			const result = await this._bookingService.getOwnerBookings(
				ownerId,
				page,
				limit,
				status,
			);

			const mappedResult = {
				...result,
				data: result.data.map((b: IBooking) => bookingDTO(b)),
			};

			successResponse(res, "Owner bookings fetched successfully", mappedResult);
		} catch (error) {
			console.error("Error in getOwnerBookings controller:", error);
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

	async getOwnerDashboard(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as Request & { user?: { userId: string } }).user;
			const ownerId = user?.userId;

			if (!ownerId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}

			const stats = await this._bookingService.getOwnerDashboard(ownerId);
			successResponse(res, "Owner dashboard fetched successfully", stats);
		} catch (error) {
			console.error("Error in getOwnerDashboard controller:", error);
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async returnVehicle(req: Request, res: Response): Promise<void> {
		try {
			const user = req.user;
			const requesterId = user?.userId;
			if (!requesterId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}
			const { bookingId } = req.params;
			const booking = await this._bookingService.returnVehicle(bookingId, requesterId);
			if (!booking) {
				errorResponse(res, "Booking not found", HttpStatus.NOT_FOUND);
				return;
			}
			successResponse(res, "Vehicle returned successfully", bookingDTO(booking));
		} catch (error) {
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async requestExtension(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user?.userId;
			if (!userId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}
			const { bookingId } = req.params;
			const { newReturnDate, reason } = req.body;
			if (!newReturnDate) {
				errorResponse(res, "newReturnDate is required", HttpStatus.BAD_REQUEST);
				return;
			}
			const booking = await this._bookingService.requestExtension(
				bookingId,
				userId,
				new Date(newReturnDate),
				reason,
			);
			if (!booking) {
				errorResponse(res, "Booking not found", HttpStatus.NOT_FOUND);
				return;
			}
			successResponse(res, "Extension requested successfully", bookingDTO(booking));
		} catch (error) {
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async approveExtension(req: Request, res: Response): Promise<void> {
		try {
			const ownerId = req.user?.userId;
			if (!ownerId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}
			const { bookingId } = req.params;
			const { approved } = req.body;
			if (typeof approved !== "boolean") {
				errorResponse(res, "'approved' (boolean) is required", HttpStatus.BAD_REQUEST);
				return;
			}
			const booking = await this._bookingService.approveExtension(bookingId, ownerId, approved);
			if (!booking) {
				errorResponse(res, "Booking not found", HttpStatus.NOT_FOUND);
				return;
			}
			const msg = approved ? "Extension approved" : "Extension rejected";
			successResponse(res, msg, bookingDTO(booking));
		} catch (error) {
			errorResponse(
				res,
				error instanceof Error ? error.message : "Internal server error",
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async getOverdueBookings(req: Request, res: Response): Promise<void> {
		try {
			const ownerId = req.user?.userId;
			if (!ownerId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}
			const bookings = await this._bookingService.getOverdueBookingsForOwner(ownerId);
			successResponse(res, "Overdue bookings fetched", bookings.map((b: IBooking) => bookingDTO(b)));
		} catch (error) {
			errorResponse(res, error instanceof Error ? error.message : "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async getPendingExtensions(req: Request, res: Response): Promise<void> {
		try {
			const ownerId = req.user?.userId;
			if (!ownerId) {
				errorResponse(res, "User not authenticated", HttpStatus.UNAUTHORIZED);
				return;
			}
			const bookings = await this._bookingService.getPendingExtensions(ownerId);
			successResponse(res, "Pending extensions fetched", bookings.map((b: IBooking) => bookingDTO(b)));
		} catch (error) {
			errorResponse(res, error instanceof Error ? error.message : "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async getRunningOvertimeFee(req: Request, res: Response): Promise<void> {
		try {
			const { bookingId } = req.params;
			const fee = await this._bookingService.getRunningOvertimeFee(bookingId);
			successResponse(res, "Running overtime fee calculated", fee);
		} catch (error) {
			errorResponse(res, error instanceof Error ? error.message : "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

