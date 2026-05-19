import mongoose, { Schema } from "mongoose";
import type { IBooking } from "../types/booking/booking.types";

const BookingSchema = new Schema<IBooking>(
	{
		bookingId: {
			type: String,
			required: true,
			unique: true,
		},
		vehicleId: {
			type: Schema.Types.ObjectId,
			ref: "Vehicle",
			required: true,
		},

		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		ownerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		startDate: {
			type: Date,
			required: true,
		},

		endDate: {
			type: Date,
			required: true,
		},

		withFuel: {
			type: Boolean,
			default: false,
		},

		pricePerDay: {
			type: Number,
			required: true,
			min: 0,
		},

		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},

		advancePaid: {
			type: Number,
			default: 0,
			min: 0,
		},

		paymentIntentId: {
			type: String,
		},

		paymentStatus: {
			type: String,
			enum: ["pending", "authorized", "captured", "refunded", "failed"],
			default: "pending",
		},

		bookingStatus: {
			type: String,
			enum: [
				"requested",
				"approved",
				"advance_authorized",
				"ride_started",
				"payment_captured",
				"completed",
				"cancelled",
				"cancel_requested",
				"no_show",
				"rejected",
				"overdue",
				"extended",
			],
			default: "requested",
		},

		cancellationReason: { type: String, trim: true },
		cancelledBy: { type: String, enum: ["user", "owner", "system", "admin"] },
		cancelledAt: { type: Date },
		refundAmount: { type: Number, min: 0 },
		refundStatus: { type: String, enum: ["pending", "processed", "failed"] },
		cancellationCharge: { type: Number, min: 0 },

		tracking: {
			isEnabled: { type: Boolean, default: false },
		},

		// ── Return Tracking ────────────────────────────────────────────────
		expectedReturnDate: { type: Date },
		actualReturnDate: { type: Date },
		returnStatus: {
			type: String,
			enum: ["pending", "returned", "overdue", "extended"],
			default: "pending",
		},

		// ── Extension ──────────────────────────────────────────────────────
		extensionRequested: { type: Boolean, default: false },
		extensionApproved: { type: Boolean, default: false },
		extensionRejected: { type: Boolean, default: false },
		extensionReason: { type: String, trim: true },
		extendedTill: { type: Date },
		extensionRequestedAt: { type: Date },

		// ── Late / Overtime Fees ───────────────────────────────────────────
		extraHours: { type: Number, min: 0, default: 0 },
		extraDays: { type: Number, min: 0, default: 0 },
		lateFee: { type: Number, min: 0, default: 0 },
		overtimeCharge: { type: Number, min: 0, default: 0 },
		securityDepositDeduction: { type: Number, min: 0, default: 0 },
		pendingDues: { type: Number, min: 0, default: 0 },
	},
	{
		timestamps: true,
	},
);
BookingSchema.index({ userId: 1, bookingStatus: 1 });
BookingSchema.index({ ownerId: 1, bookingStatus: 1 });
BookingSchema.index({ vehicleId: 1, startDate: 1, endDate: 1 });

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
