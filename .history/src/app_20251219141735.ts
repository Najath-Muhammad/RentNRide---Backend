import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import {  errorMiddleware } from "./middlewares/ErrorHandling";
//import { AuthGuard } from './middlewares/authGuard';
import adminRouter from "./route/adminRouter";
import authRouter from "./route/authRouter";
import { checkBlocked } from "./middlewares/checkBlocked";
import { AuthService } from "./services/Implementation/AuthServices";
import { UserRepo } from "./repositories/Implementation/user.repository";
import fileRouter from "./route/fileRouter";

// const userRepo = new UserRepo()
// const authService = new AuthService(userRepo) 

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
)
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.use(errorMiddleware)



app.use("/api/auth", authRouter)
app.use("/api/files",fileRouter)
app.use("/api/vehi")
//app.use(checkBlocked(authService))
app.use("/api/admin", adminRouter)


export { app };
