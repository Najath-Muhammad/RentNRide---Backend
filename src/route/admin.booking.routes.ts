import { Router } from "express";
import { ADMIN_ONLY } from "../constants/roles";
import { AdminBookingController } from "../controller/Implementation/admin.booking.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { BookingRepo } from "../repositories/Implementation/booking.repository";
import { AdminBookingService } from "../services/Implementation/admin.booking.service";

const adminBookingRouter = Router();

const bookingRepo = new BookingRepo();
const adminBookingService = new AdminBookingService(bookingRepo);
const adminBookingController = new AdminBookingController(adminBookingService);

adminBookingRouter.get(
	"/",
	AuthGuard(ADMIN_ONLY),
	adminBookingController.getAllBookings.bind(adminBookingController),
);

adminBookingRouter.patch(
	"/:bookingId/cancel",
	AuthGuard(ADMIN_ONLY),
	adminBookingController.cancelBooking.bind(adminBookingController),
);

export default adminBookingRouter;
