import { Router } from "express";
import { ALL_ROLES, USER_ROLES } from "../constants/roles";
import { BookingController } from "../controller/Implementation/booking.controller";
import { AuthGuard } from "../middlewares/authGuard";
import { checkBlocked } from "../middlewares/checkBlocked";
import { BookingRepo } from "../repositories/Implementation/booking.repository";
import { ConversationRepo } from "../repositories/Implementation/conversation.repository";
import { MessageRepo } from "../repositories/Implementation/message.repository";
import { UserRepo } from "../repositories/Implementation/user.repository";
import { VehicleRepo } from "../repositories/Implementation/vehicle.repository";
import { AuthService } from "../services/Implementation/auth.service";
import { BookingService } from "../services/Implementation/booking.service";
import { ChatService } from "../services/Implementation/chat.service";

const bookingRouter = Router();

const vehicleRepo = new VehicleRepo();
const bookingRepo = new BookingRepo();
const userRepo = new UserRepo();
const messageRepo = new MessageRepo();
const conversationRepo = new ConversationRepo();

const chatService = new ChatService(messageRepo, conversationRepo);
const bookingService = new BookingService(
	vehicleRepo,
	bookingRepo,
	chatService,
);
const authService = new AuthService(userRepo);
const bookingController = new BookingController(bookingService);

bookingRouter.post(
	"/",
	AuthGuard(ALL_ROLES),
	checkBlocked(authService),
	bookingController.createBooking.bind(bookingController),
);

bookingRouter.get(
	"/user",
	AuthGuard(USER_ROLES),
	checkBlocked(authService),
	bookingController.getUserBookings.bind(bookingController),
);

bookingRouter.patch(
	"/:bookingId/cancel",
	AuthGuard(USER_ROLES),
	checkBlocked(authService),
	bookingController.cancelBooking.bind(bookingController),
);

export default bookingRouter;
