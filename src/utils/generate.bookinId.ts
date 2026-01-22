import type { IBookingRepo } from "../repositories/interfaces/booking.interface";

export async function generateBookingId(bookingRepo: IBookingRepo): Promise<string> {
	const year = new Date().getFullYear();
	const count = await bookingRepo.countDocuments({
		createdAt: { $gte: new Date(`${year}-01-01`) },
	});
	return `BK-${year}-${(count + 1).toString().padStart(5, "0")}`;
}
