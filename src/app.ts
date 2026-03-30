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

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json({ limit: "10mb" }));
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

export { app };
