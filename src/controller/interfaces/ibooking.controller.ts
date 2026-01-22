import type { Request, Response } from "express";

export interface IBookingController {
	createBooking(req: Request, res: Response): Promise<void>;
	getUserBookings(req: Request, res: Response): Promise<void>;
	cancelBooking(req: Request, res: Response): Promise<void>;
}
