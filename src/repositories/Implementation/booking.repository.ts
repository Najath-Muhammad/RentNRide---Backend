import type { Document, FilterQuery, Types } from "mongoose";
import { BookingModel } from "../../model/booking.model";
import type { IBooking } from "../../types/booking/booking.types";
import { BaseRepo } from "./base.repository";
import type { IBookingRepo } from "../interfaces/booking.interface";

export class BookingRepo extends BaseRepo<IBooking> implements IBookingRepo {
  constructor() {
    super(BookingModel);
  }

  async findBookingsByUser(
    userId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 10,
    status?: IBooking["bookingStatus"]
  ) {
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IBooking> = { userId };

    if (status) {
      filter.bookingStatus = status;
    }

    const bookings = await this.model
      .find(filter)
      .populate("vehicleId", "brand modelName vehicleId images") 
      .populate("ownerId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.model.countDocuments(filter).exec();

    return {
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBookingsByOwner(
    ownerId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 10,
    status?: IBooking["bookingStatus"]
  ) {
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IBooking> = { ownerId };

    if (status) {
      filter.bookingStatus = status;
    }

    const bookings = await this.model
      .find(filter)
      .populate("vehicleId", "brand modelName vehicleId")
      .populate("userId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.model.countDocuments(filter).exec();

    return {
      data: bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findActiveBookingsForVehicle(
    vehicleId: string | Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<IBooking[]> {
    const filter: FilterQuery<IBooking> = {
      vehicleId,
      bookingStatus: { $in: ["pending", "confirmed", "ongoing"] },
    };

    if (startDate && endDate) {
      filter.$or = [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
        { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
      ];
    }

    return await this.model.find(filter).sort({ startDate: 1 }).exec();
  }

  async getBookingStats() {
    try {
      const totalBookings = await this.model.countDocuments().exec();

      const [pending, confirmed, ongoing, completed, cancelled, refunded] = await Promise.all([
        this.model.countDocuments({ bookingStatus: "pending" }).exec(),
        this.model.countDocuments({ bookingStatus: "confirmed" }).exec(),
        this.model.countDocuments({ bookingStatus: "ongoing" }).exec(),
        this.model.countDocuments({ bookingStatus: "completed" }).exec(),
        this.model.countDocuments({ bookingStatus: "cancelled" }).exec(),
        this.model.countDocuments({ paymentStatus: "refunded" }).exec(),
      ]);

      return {
        totalBookings,
        pending,
        confirmed,
        ongoing,
        completed,
        cancelled,
        refunded,
      };
    } catch (error) {
      console.error("Error in getBookingStats:", error);
      return {
        totalBookings: 0,
        pending: 0,
        confirmed: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        refunded: 0,
      };
    }
  }

  async cancelBooking(
    bookingId: string | Types.ObjectId,
    cancelledBy: "user" | "owner" | "system",
    reason?: string
  ): Promise<IBooking | null> {
    const update: Partial<IBooking> = {
      bookingStatus: "cancelled",
      cancelledBy,
      cancellationReason: reason?.trim() || undefined,
    };


    return await this.model
      .findByIdAndUpdate(bookingId, update, { new: true })
      .exec();
  }
}