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

	async getOwnerBookings(
		ownerId: string | Types.ObjectId,
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
			// Auto-expire stale bookings for this owner's vehicles
			await this._bookingRepo.expireStaleBookings();

			return await this._bookingRepo.findBookingsByOwner(
				ownerId,
				page,
				limit,
				status as IBooking["bookingStatus"],
			);
		} catch (error) {
			console.error("Error in getOwnerBookings:", error);
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

			// Notify user/owner via FCM and In-App Notification
			try {
				const notifyTargetId = isOwner ? booking.userId.toString() : booking.ownerId.toString();
				const cancelledByStr = isOwner ? "Owner" : "User";
				
				const title = `Booking Cancelled ❌`;
				const message = `${cancelledByStr} cancelled the booking ${booking.bookingId}.`;
				
				// Push Notification
				await sendPushNotification(notifyTargetId, {
					title,
					body: message,
					data: { type: "booking", bookingId: booking.bookingId },
				});

				// In-App Notification
				const { NotificationModel } = require("../../model/notification.model");
				await NotificationModel.create({
					userId: notifyTargetId,
					title,
					message,
					type: "booking",
					metadata: { bookingId: booking._id.toString() }
				});
			} catch (notifyErr) {
				console.error("[Notification] Cancel notification failed:", notifyErr);
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

	// ─────────────────────────────────────────────────────────────────────────
	// RETURN VEHICLE
	// ─────────────────────────────────────────────────────────────────────────
	async returnVehicle(
		bookingId: string,
		requesterId: string | Types.ObjectId,
	): Promise<IBooking | null> {
		const { calculateOvertimeFee } = await import("../../utils/overtime.util");

		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking) throw new Error("Booking not found");

		const isOwner = booking.ownerId.toString() === requesterId.toString();
		const isUser = booking.userId.toString() === requesterId.toString();
		if (!isOwner && !isUser) throw new Error("Not authorised to mark this booking as returned");

		const allowedStatuses = ["ride_started", "extended", "overdue"];
		if (!allowedStatuses.includes(booking.bookingStatus)) {
			throw new Error(`Cannot mark return for booking in status: ${booking.bookingStatus}`);
		}

		const now = new Date();
		const expectedReturn = booking.extendedTill ?? booking.expectedReturnDate ?? booking.endDate;
		const fee = calculateOvertimeFee(expectedReturn, now, booking.pricePerDay);

		const updated = await this._bookingRepo.updateBookingDetails(bookingId, {
			bookingStatus: "completed",
			returnStatus: "returned",
			actualReturnDate: now,
			extraHours: fee.extraHours,
			extraDays: fee.extraDays,
			lateFee: fee.lateFee,
			overtimeCharge: fee.overtimeCharge,
			pendingDues: fee.lateFee > 0 ? fee.lateFee : 0,
		});

		// Notify both parties
		const userId = booking.userId.toString();
		const ownerId = booking.ownerId.toString();

		const lateFeeMsg = fee.lateFee > 0
			? ` Late charge: ₹${fee.lateFee.toLocaleString("en-IN")}.`
			: "";

		await sendPushNotification(userId, {
			title: "✅ Vehicle Returned",
			body: `Booking ${booking.bookingId} marked as returned.${lateFeeMsg}`,
			data: { type: "return", bookingId: booking.bookingId },
		});

		await sendPushNotification(ownerId, {
			title: "✅ Vehicle Returned",
			body: `Renter returned vehicle for booking ${booking.bookingId}.${lateFeeMsg}`,
			data: { type: "return", bookingId: booking.bookingId },
		});

		return updated;
	}

	// ─────────────────────────────────────────────────────────────────────────
	// REQUEST EXTENSION
	// ─────────────────────────────────────────────────────────────────────────
	async requestExtension(
		bookingId: string,
		userId: string | Types.ObjectId,
		newReturnDate: Date,
		reason?: string,
	): Promise<IBooking | null> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking) throw new Error("Booking not found");

		if (booking.userId.toString() !== userId.toString()) {
			throw new Error("Only the renter can request an extension");
		}

		const allowedStatuses = ["ride_started", "extended", "overdue"];
		if (!allowedStatuses.includes(booking.bookingStatus)) {
			throw new Error(`Cannot request extension for booking in status: ${booking.bookingStatus}`);
		}

		if (booking.extensionRequested && !booking.extensionRejected) {
			throw new Error("An extension request is already pending");
		}

		const currentEnd = booking.extendedTill ?? booking.endDate;
		if (newReturnDate <= currentEnd) {
			throw new Error("New return date must be after the current end date");
		}

		// Check vehicle availability for the extension period
		const overlapping = await this._bookingRepo.findActiveBookingsForVehicle(
			booking.vehicleId,
			currentEnd,
			newReturnDate,
		);
		const conflict = overlapping.filter((b) => b._id.toString() !== bookingId);
		if (conflict.length > 0) {
			throw new Error("Vehicle is not available for the requested extension period");
		}

		const updated = await this._bookingRepo.updateBookingDetails(bookingId, {
			extensionRequested: true,
			extensionApproved: false,
			extensionRejected: false,
			extendedTill: newReturnDate,
			extensionReason: reason?.trim(),
			extensionRequestedAt: new Date(),
		});

		// Notify owner
		await sendPushNotification(booking.ownerId.toString(), {
			title: "📅 Extension Requested",
			body: `Renter requested an extension for booking ${booking.bookingId} until ${newReturnDate.toLocaleDateString("en-IN")}.`,
			data: { type: "extension_request", bookingId: booking.bookingId },
		});

		return updated;
	}

	// ─────────────────────────────────────────────────────────────────────────
	// APPROVE / REJECT EXTENSION
	// ─────────────────────────────────────────────────────────────────────────
	async approveExtension(
		bookingId: string,
		ownerId: string | Types.ObjectId,
		approved: boolean,
	): Promise<IBooking | null> {
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking) throw new Error("Booking not found");

		if (booking.ownerId.toString() !== ownerId.toString()) {
			throw new Error("Only the vehicle owner can approve extensions");
		}

		if (!booking.extensionRequested) throw new Error("No extension request found");
		if (booking.extensionApproved) throw new Error("Extension already approved");

		let updateData: Partial<IBooking>;

		if (approved) {
			const newEndDate = booking.extendedTill!;

			// Re-verify availability (no new conflicting bookings since request)
			const currentEnd = booking.endDate;
			const overlapping = await this._bookingRepo.findActiveBookingsForVehicle(
				booking.vehicleId,
				currentEnd,
				newEndDate,
			);
			const conflict = overlapping.filter((b) => b._id.toString() !== bookingId);
			if (conflict.length > 0) {
				throw new Error("Vehicle is no longer available for this extension period");
			}

			// Recalculate extra amount
			const extensionDays = Math.ceil(
				(newEndDate.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24),
			);
			const extraAmount = extensionDays * booking.pricePerDay;

			updateData = {
				extensionApproved: true,
				extensionRejected: false,
				bookingStatus: "extended",
				returnStatus: "extended",
				expectedReturnDate: newEndDate,
				endDate: newEndDate,
				totalAmount: booking.totalAmount + extraAmount,
				pendingDues: (booking.pendingDues ?? 0) + extraAmount,
			};

			// Notify renter
			await sendPushNotification(booking.userId.toString(), {
				title: "✅ Extension Approved!",
				body: `Your extension for booking ${booking.bookingId} was approved until ${newEndDate.toLocaleDateString("en-IN")}.`,
				data: { type: "extension_approved", bookingId: booking.bookingId },
			});
		} else {
			updateData = {
				extensionRejected: true,
				extensionApproved: false,
				extendedTill: undefined as unknown as Date,
			};

			// Notify renter
			await sendPushNotification(booking.userId.toString(), {
				title: "❌ Extension Rejected",
				body: `Your extension request for booking ${booking.bookingId} was declined by the owner.`,
				data: { type: "extension_rejected", bookingId: booking.bookingId },
			});
		}

		return this._bookingRepo.updateBookingDetails(bookingId, updateData);
	}

	// ─────────────────────────────────────────────────────────────────────────
	// OWNER OVERDUE & EXTENSIONS
	// ─────────────────────────────────────────────────────────────────────────
	async getOverdueBookingsForOwner(ownerId: string | Types.ObjectId): Promise<IBooking[]> {
		return this._bookingRepo.getOverdueBookingsForOwner(ownerId);
	}

	async getPendingExtensions(ownerId: string | Types.ObjectId): Promise<IBooking[]> {
		return this._bookingRepo.getPendingExtensions(ownerId);
	}

	async getRunningOvertimeFee(bookingId: string): Promise<{
		extraHours: number;
		extraDays: number;
		lateFee: number;
		isOverGrace: boolean;
	}> {
		const { calculateRunningOvertimeFee } = await import("../../utils/overtime.util");
		const booking = await this._bookingRepo.findById(bookingId);
		if (!booking) throw new Error("Booking not found");

		const expectedReturn = booking.extendedTill ?? booking.expectedReturnDate ?? booking.endDate;
		const fee = calculateRunningOvertimeFee(expectedReturn, booking.pricePerDay);
		return {
			extraHours: fee.extraHours,
			extraDays: fee.extraDays,
			lateFee: fee.lateFee,
			isOverGrace: fee.isOverGrace,
		};
	}
}

