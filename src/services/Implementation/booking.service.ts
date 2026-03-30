import { Types } from "mongoose";
import type { IBookingRepo } from "../../repositories/interfaces/booking.interface";
import type { IVehicleRepository } from "../../repositories/interfaces/vehicle.interface";
import type {
	CreateBookingInput,
	IBooking,
} from "../../types/booking/booking.types";
import { generateBookingId } from "../../utils/generate.bookinId";
import type { IBookingService } from "../Interfaces/booking.interface.service";

export class BookingService implements IBookingService {
	constructor(
		private _vehicleRepo: IVehicleRepository,
		private _bookingRepo: IBookingRepo,
	) { }

	async getBookingById(
		bookingId: string,
		requesterId: string | Types.ObjectId,
		role: "user" | "owner" | "admin",
	): Promise<IBooking | null> {
		try {
			const booking = await this._bookingRepo.findById(bookingId)
			if (!booking) return null
			if (role === "admin") return booking
			if (role === "user" && booking.userId.toString() === requesterId.toString()) {
				return booking
			}
			if (role === "owner" && booking.ownerId.toString() === requesterId.toString()) {
				return booking
			}
			return null
		} catch (error) {
			console.error("Error in getBookingById:", error)
			throw error
		}
	}

	async getUserBookings(
		userId: string | Types.ObjectId,
		page: number = 1,
		limit: number = 10,
		status?: string,
	): Promise<{
		data: IBooking[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}> {
		try {
			// Auto-expire stale bookings for this user before returning the list
			await this._bookingRepo.expireStaleBookings(userId);

			return await this._bookingRepo.findBookingsByUser(
				userId,
				page,
				limit,
				status as IBooking["bookingStatus"],
			);
		} catch (error) {
			console.error("Error in getUserBookings:", error);
			throw error;
		}
	}

	async createBooking(userId: string | Types.ObjectId, input: CreateBookingInput): Promise<IBooking> {
		try {
			const { vehicleId, startDate, endDate, withFuel = false } = input

			const start = new Date(startDate);
			const end = new Date(endDate);

			if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
				throw new Error("Invalid date format");
			}
			if (start >= end) {
				throw new Error("End date must be after start date");
			}
			if (start < new Date()) {
				throw new Error("Cannot book in the past");
			}
			const vehicle = await this._vehicleRepo.findById(vehicleId);
			if (!vehicle) {
				throw new Error("Vehicle not found");
			}
			if (!vehicle.isApproved || !vehicle.isActive) {
				throw new Error("Vehicle is not available for booking");
			}
			const overlapping = await this._bookingRepo.findActiveBookingsForVehicle(
				vehicleId,
				start,
				end,
			);

			if (overlapping.length > 0) {
				throw new Error("Vehicle is not available for the selected dates");
			}
			const days = Math.ceil(
				(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
			);
			const pricePerDay = vehicle.pricePerDay || 0;
			const totalAmount = pricePerDay * days;
			const advancePaid = Math.round(totalAmount * 0.2);

			const bookingData: Partial<IBooking> = {
				bookingId: await generateBookingId(this._bookingRepo),
				vehicleId:
					typeof vehicleId === "string"
						? new Types.ObjectId(vehicleId)
						: vehicleId,
				userId:
					typeof userId === "string" ? new Types.ObjectId(userId) : userId,
				ownerId: vehicle.ownerId,
				startDate: start,
				endDate: end,
				withFuel,
				pricePerDay,
				totalAmount,
				advancePaid,
				paymentStatus: "pending",
				bookingStatus: "pending",
				tracking: { isEnabled: false },
			};

			const newBooking = await this._bookingRepo.create(bookingData);

<<<<<<< Updated upstream
=======
			if (this._chatService) {
				try {
					const startStr = start.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
					const endStr = end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
					const details = `🚗 Rent Request — ${vehicle.brand} ${vehicle.modelName}\n📅 ${startStr} → ${endStr} (${days} day${days > 1 ? "s" : ""})\n💰 Total: ₹${totalAmount.toLocaleString("en-IN")} (20% advance: ₹${advancePaid.toLocaleString("en-IN")})${withFuel ? "\n⛽ With Fuel" : ""}\nBooking ID: ${newBooking.bookingId}`;
					await this._chatService.handleBookingRequest(
						userId,
						vehicle.ownerId,
						newBooking._id,
						vehicle._id,
						details,
					);
				} catch (chatErr) {
					console.error("Chat notification failed (non-fatal):", chatErr);
				}
			}

>>>>>>> Stashed changes
			return newBooking;
		} catch (error) {
			console.error("Error in createBooking:", error);
			throw error;
		}
	}

	async cancelBooking(
		bookingId: string,
		userId: string | Types.ObjectId,
		reason?: string,
	): Promise<IBooking | null> {
		try {
			const booking = await this._bookingRepo.findById(bookingId);
			if (!booking) {
				throw new Error("Booking not found");
			}

			if (booking.userId.toString() !== userId.toString()) {
				throw new Error("Not authorized to cancel this booking");
			}

			if (booking.bookingStatus === "cancelled") {
				throw new Error("Booking is already cancelled");
			}

			if (booking.bookingStatus === "completed") {
				throw new Error("Cannot cancel a completed booking");
			}

			return await this._bookingRepo.cancelBooking(bookingId, "user", reason);
		} catch (error) {
			console.error("Error in cancelBooking:", error);
			throw error;
		}
	}
}
