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
		| "cancel_requested"
		| "no_show"
		| "rejected"
		| "overdue"
		| "extended";
	cancellationReason?: string;
	cancelledBy?: "user" | "owner" | "system" | "admin";
	cancelledAt?: Date;
	refundAmount?: number;
	refundStatus?: "pending" | "processed" | "failed";
	cancellationCharge?: number;
	tracking: { isEnabled: boolean };
	// Return tracking
	expectedReturnDate?: Date;
	actualReturnDate?: Date;
	returnStatus?: "pending" | "returned" | "overdue" | "extended";
	// Extension
	extensionRequested?: boolean;
	extensionApproved?: boolean;
	extensionRejected?: boolean;
	extensionReason?: string;
	extendedTill?: Date;
	extensionRequestedAt?: Date;
	// Late fees
	extraHours?: number;
	extraDays?: number;
	lateFee?: number;
	overtimeCharge?: number;
	securityDepositDeduction?: number;
	pendingDues?: number;
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
