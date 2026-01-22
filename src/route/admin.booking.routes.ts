import { Router } from "express";
import { AdminBookingController } from "../controller/Implementation/admin.booking.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { BookingRepo } from "../repositories/Implementation/booking.repository";
import { AdminBookingService } from "../services/Implementation/admin.booking.service";

const adminBookingRouter = Router();

const bookingRepo = new BookingRepo();
const adminBookingService = new AdminBookingService(bookingRepo);
const adminBookingController = new AdminBookingController(adminBookingService);

// Admin Routes
adminBookingRouter.get(
	"/",
	AuthGuard(["admin"]),
	adminBookingController.getAllBookings.bind(adminBookingController),
);

adminBookingRouter.patch(
	"/:bookingId/cancel",
	AuthGuard(["admin"]),
	adminBookingController.cancelBooking.bind(adminBookingController),
);

export default adminBookingRouter;
