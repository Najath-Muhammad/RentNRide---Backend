import type { Document, Types } from "mongoose";

export interface IBooking extends Document {
	_id: Types.ObjectId;
	bookingId: string;
	vehicleId: Types.ObjectId;
	userId: Types.ObjectId;
	ownerId: Types.ObjectId;
	startDate: Date;
	endDate: Date;
	withFuel: boolean;
	pricePerDay: number;
	totalAmount: number;
	advancePaid: number;
	paymentIntentId?: string;
	paymentStatus: "pending" | "authorized" | "captured" | "refunded" | "failed";
	bookingStatus:
	| "requested"
	| "approved"
	| "advance_authorized"
	| "ride_started"
	| "payment_captured"
	| "completed"
	| "cancelled"
	| "rejected";
	cancellationReason?: string;
	cancelledBy?: "user" | "owner" | "system";
	tracking: { isEnabled: boolean };
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateBookingInput {
	vehicleId: string | Types.ObjectId;
	ownerId: string | Types.ObjectId;
	startDate: Date | string;
	endDate: Date | string;
	withFuel: boolean;
	pricePerDay: number;
	totalAmount: number;
	advancePaid?: number;
}

export type BookingDocument = IBooking;
