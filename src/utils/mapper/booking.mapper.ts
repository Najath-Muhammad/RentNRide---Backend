import type { IBooking } from "../../types/booking/booking.types";

export const bookingDTO = (booking: IBooking): Partial<IBooking> => {
	// Provide safe mapping of booking to frontend without internal Mongoose fields like __v
	return {
		_id: booking._id,
		bookingId: booking.bookingId,
		userId: booking.userId, // may be populated
		vehicleId: booking.vehicleId, // may be populated
		ownerId: booking.ownerId, // may be populated
		startDate: booking.startDate,
		endDate: booking.endDate,
		totalAmount: booking.totalAmount,
		bookingStatus: booking.bookingStatus,
		paymentStatus: booking.paymentStatus,
		paymentIntentId: booking.paymentIntentId,
		advancePaid: booking.advancePaid,
		cancellationReason: booking.cancellationReason,
		cancelledBy: booking.cancelledBy,
		createdAt: booking.createdAt,
		updatedAt: booking.updatedAt,
		withFuel: booking.withFuel,
		pricePerDay: booking.pricePerDay,
		tracking: booking.tracking,
	};
};
