import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorMiddleware } from "./middlewares/ErrorHandling";
//import { AuthGuard } from './middlewares/authGuard';
import adminRouter from "./route/admin.routes";
import authRouter from "./route/auth.routes";
import fileRouter from "./route/file.routes";
import vehicleRouter from "./route/vehicle.routes";

// const userRepo = new UserRepo()
// const authService = new AuthService(userRepo)

import { ROUTES } from "./constants/Routes/routeConstants";
import adminBookingRouter from "./route/admin.booking.routes";

import bookingRouter from "./route/booking.routes";
import reviewRouter from "./route/review.routes";
import userRouter from "./route/user.routes";
import subscriptionRouter from "./route/subscription.routes";
import chatRouter from "./route/chat.routes";
import paymentRouter from "./route/payment.routes";
import walletRouter from "./route/wallet.routes";
import chatbotRouter from "./route/chatbot.routes";
import fcmRouter from "./route/fcm.routes";
const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
);

// We need raw body for stripe webhook, json parser for everything else.
app.use((req, res, next) => {
	if (req.originalUrl.includes("/webhook")) {
		express.raw({ type: "application/json" })(req, res, next);
	} else {
		express.json({ limit: "10mb" })(req, res, next);
	}
});

app.use(cookieParser());
app.use(errorMiddleware);

app.use(ROUTES.AUTH.BASE, authRouter);
app.use(ROUTES.FILE.BASE, fileRouter);
app.use(ROUTES.VEHICLE.BASE, vehicleRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/user", userRouter);
//app.use(checkBlocked(authService))
app.use(ROUTES.ADMIN.BASE, adminRouter);

app.use("/api/reviews", reviewRouter);
app.use("/api/admin/bookings", adminBookingRouter);
app.use("/api", subscriptionRouter);
app.use("/api/chat", chatRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/fcm", fcmRouter);

export { app };
