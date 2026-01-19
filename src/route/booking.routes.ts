import { Router } from 'express';
import { BookingController } from '../controller/Implementation/booking.controller';
import { checkBlocked } from '../middlewares/checkBlocked';
import { AuthGuard } from '../middlewares/authGuard';
import { VehicleRepo } from '../repositories/Implementation/vehicle.repository';
import { BookingRepo } from '../repositories/Implementation/booking.repository';
import { UserRepo } from '../repositories/Implementation/user.repository';
import { BookingService } from '../services/Implementation/booking.service';
import { AuthService } from '../services/Implementation/auth.service';

const bookingRouter = Router();

const vehicleRepo = new VehicleRepo();
const bookingRepo = new BookingRepo();
const userRepo = new UserRepo();

const bookingService = new BookingService(vehicleRepo, bookingRepo);
const authService = new AuthService(userRepo);
const bookingController = new BookingController(bookingService);

bookingRouter.post(
  '/',
  AuthGuard(['user', 'admin']),
  checkBlocked(authService),
  bookingController.createBooking.bind(bookingController)
);

export default bookingRouter;