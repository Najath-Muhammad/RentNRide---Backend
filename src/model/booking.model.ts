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
				"rejected",
			],
			default: "requested",
		},

		cancellationReason: {
			type: String,
			trim: true,
		},

		cancelledBy: {
			type: String,
			enum: ["user", "owner", "system"],
		},

		tracking: {
			isEnabled: {
				type: Boolean,
				default: false,
			},
		},
	},
	{
		timestamps: true,
	},
);
BookingSchema.index({ userId: 1, bookingStatus: 1 });
BookingSchema.index({ ownerId: 1, bookingStatus: 1 });
BookingSchema.index({ vehicleId: 1, startDate: 1, endDate: 1 });

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
