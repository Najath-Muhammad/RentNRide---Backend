import { Request, Response } from 'express';
import { HttpStatus } from '../../constants/enum/statuscode';
import { IBookingService } from '../../services/Interfaces/booking.interface.service';
import { errorResponse, successResponse } from '../../utils/response.util';
import type { IBookingController } from '../interfaces/ibooking.controller';

export class BookingController implements IBookingController {
  constructor(private _bookingService: IBookingService) {}

  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      console.log('Booking controller reached');
      
      const user = (req as any).user;
      const userId = user?.userId;

      if (!userId) {
        errorResponse(res, 'User not authenticated', HttpStatus.UNAUTHORIZED);
        return;
      }

      const bookingData = req.body;
      const booking = await this._bookingService.createBooking(userId, bookingData);

      successResponse(res, 'Booking created successfully. Awaiting owner confirmation.', {
        bookingId: booking.bookingId,
        totalAmount: booking.totalAmount,
        advancePaid: booking.advancePaid,
        status: booking.bookingStatus,
      });
    } catch (error) {
      console.error("Error in createBooking controller:", error);
      errorResponse(
        res,
        error instanceof Error ? error.message : "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}