import type { Request, Response } from "express";

export interface IAdminBookingController {
	getAllBookings(req: Request, res: Response): Promise<void>;
	cancelBooking(req: Request, res: Response): Promise<void>;
}
