import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import {  errorMiddleware } from "./middlewares/ErrorHandling";
//import { AuthGuard } from './middlewares/authGuard';
import adminRouter from "./route/adminRouter";
import authRouter from "./route/authRouter";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
//app.use(AuthGuard)
app.use(errorMiddleware);

// app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
//   console.error('🔥 Error:', err);

//   res.status(500).json({
//     message: 'Internal Server Error',
//     error: err.message || 'Unknown error'
//   });
// });

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

export { app };
