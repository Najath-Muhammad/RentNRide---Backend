import { Types } from "mongoose";
import { ROLES } from "../../constants/roles";
import type { IBookingRepo } from "../../repositories/interfaces/booking.interface";
import type { IVehicleRepository } from "../../repositories/interfaces/vehicle.interface";
import type {
	CreateBookingInput,
	IBooking,
} from "../../types/booking/booking.types";
import { sendPushNotification } from "../../utils/fcm.util";
import { generateBookingId } from "../../utils/generate.bookinId";
import type { IBookingService } from "../interfaces/booking.interface.service";
import type { IChatService } from "../interfaces/chat.interface.service";
import { PaymentService } from "./payment.service";

export class BookingService implements IBookingService {
	constructor(
		private _vehicleRepo: IVehicleRepository,
		private _bookingRepo: IBookingRepo,
		private _chatService?: IChatService,
	) {}

	async getBookingById(
		bookingId: string,
		requesterId: string | Types.ObjectId,
		role: typeof ROLES.USER | "owner" | typeof ROLES.ADMIN,
	): Promise<IBooking | null> {
		try {
			const booking = await this._bookingRepo.findById(bookingId);
			if (!booking) return null;
			if (role === ROLES.ADMIN) return booking;
			if (
				role === ROLES.USER &&
				booking.userId.toString() === requesterId.toString()
			) {
				return booking;
			}
			if (
				role === "owner" &&
				booking.ownerId.toString() === requesterId.toString()
			) {
				return booking;
			}
			return null;
		} catch (error) {
			console.error("Error in getBookingById:", error);
			throw error;
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

	async createBooking(
		userId: string | Types.ObjectId,
		input: CreateBookingInput,
	): Promise<IBooking> {
		try {
			const { vehicleId, startDate, endDate, withFuel = false } = input;

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
				bookingStatus: "requested",
				tracking: { isEnabled: false },
			};

			const newBooking = await this._bookingRepo.create(bookingData);

			// Notify the vehicle owner via FCM push notification
			try {
				await sendPushNotification(vehicle.ownerId.toString(), {
					title: "Car Booked 🚗",
					body: "Your car has been booked successfully",
					data: {
						type: "booking",
						bookingId: newBooking.bookingId,
					},
				});
			} catch (fcmErr) {
				console.error("[FCM] Booking notification failed (non-fatal):", fcmErr);
			}

			if (this._chatService) {
				try {
					const startStr = start.toLocaleDateString("en-IN", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					});
					const endStr = end.toLocaleDateString("en-IN", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					});
					const details = `🚗 Rent Request — ${vehicle.brand} ${vehicle.modelName}\n📅 ${startStr} → ${endStr} (${days} day${days > 1 ? "s" : ""})\n💰 Total: ₹${totalAmount.toLocaleString("en-IN")} (20% advance: ₹${advancePaid.toLocaleString("en-IN")})\n⛽ ${withFuel ? "With Fuel" : "Without Fuel"}\nBooking ID: ${newBooking.bookingId}`;
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

			const isUser = booking.userId.toString() === userId.toString();
			const isOwner = booking.ownerId.toString() === userId.toString();

			if (!isUser && !isOwner) {
				throw new Error("Not authorized to cancel this booking");
			}

			if (booking.bookingStatus === "cancelled" || booking.bookingStatus === "cancel_requested") {
				throw new Error("Booking is already cancelled or cancel requested");
			}

			if (booking.bookingStatus === "completed") {
				throw new Error("Cannot cancel a completed booking");
			}

			const now = new Date();
			const startDate = new Date(booking.startDate);

			if (now > startDate && isUser && booking.bookingStatus === "ride_started") {
				throw new Error("Cannot cancel after trip has started");
			}

			// Calculate refund
			let refundAmount = 0;
			let cancellationCharge = 0;
			const advancePaid = booking.advancePaid || 0;

			if (isOwner) {
				// Owner cancels: full refund
				refundAmount = advancePaid;
			} else {
				// User cancels: apply time-based rules
				const hoursUntilPickup = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

				if (hoursUntilPickup > 48) {
					refundAmount = advancePaid; // 100% refund
				} else if (hoursUntilPickup > 24) {
					refundAmount = advancePaid * 0.5; // 50% refund
					cancellationCharge = advancePaid - refundAmount;
				} else {
					refundAmount = 0; // No refund
					cancellationCharge = advancePaid;
				}
			}

			// Execute DB update
			const updatedBooking = await this._bookingRepo.updateBookingDetails(bookingId, {
				bookingStatus: "cancel_requested",
				cancelledBy: isOwner ? "owner" : "user",
				cancellationReason: reason?.trim(),
				cancelledAt: new Date(),
				refundAmount,
				cancellationCharge,
				refundStatus: "pending"
			});

			if (!updatedBooking) throw new Error("Failed to update booking status");

			// Trigger refund process if advance was paid via Stripe
			if (booking.paymentIntentId && booking.paymentStatus !== "failed" && booking.paymentStatus !== "refunded") {
				try {
					const paymentService = new PaymentService(this._bookingRepo);
					await paymentService.processRefund(bookingId, refundAmount, cancellationCharge);
				} catch (refundErr) {
					console.error("Refund processing error:", refundErr);
				}
			} else {
				// No stripe payment or already refunded
				await this._bookingRepo.updateBookingDetails(bookingId, {
					bookingStatus: "cancelled",
					refundStatus: "processed"
				});
			}
			
			// Final update to "cancelled" state
			await this._bookingRepo.updateBookingDetails(bookingId, {
				bookingStatus: "cancelled",
			});

			// Notify user/owner via FCM
			try {
				const notifyTargetId = isOwner ? booking.userId.toString() : booking.ownerId.toString();
				const cancelledByStr = isOwner ? "Owner" : "User";
				await sendPushNotification(notifyTargetId, {
					title: `Booking Cancelled ❌`,
					body: `${cancelledByStr} cancelled the booking ${booking.bookingId}.`,
					data: { type: "booking", bookingId: booking.bookingId },
				});
			} catch (fcmErr) {
				console.error("[FCM] Cancel notification failed:", fcmErr);
			}

			return this._bookingRepo.findById(bookingId);
		} catch (error) {
			console.error("Error in cancelBooking:", error);
			throw error;
		}
	}

	async getOwnerDashboard(ownerId: string): Promise<{
		totalRevenue: number;
		totalBookings: number;
		totalCancelled: number;
		totalVehicles: number;
		activeVehicles: number;
		earningsThisMonth: number;
		pendingPayments: number;
	}> {
		const [bookingStats, vehicleStats] = await Promise.all([
			this._bookingRepo.getOwnerDashboardStats(ownerId),
			this._vehicleRepo.getVehiclesByOwner(ownerId),
		]);

		const totalVehicles = vehicleStats.length;
		const activeVehicles = vehicleStats.filter(
			(v) => v.isApproved && v.isActive,
		).length;

		return {
			...bookingStats,
			totalVehicles,
			activeVehicles,
		};
	}
}
