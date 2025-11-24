import express, { Request, Response, NextFunction } from 'express';
import authRouter from "./route/authRouter"
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { AuthGuard } from './middlewares/authGuard';
import adminRouter from './route/adminRouter';
import { errorHandler } from './middlewares/ErrorHanling';


const app = express()


app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}))
app.use(express.json({limit:"10mb"}));
app.use(cookieParser());
//app.use(AuthGuard)
app.use(errorHandler)


app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('🔥 Error:', err);
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message || 'Unknown error'
  });
});

  
app.use("/api/auth",authRouter)
app.use("/api/admin",adminRouter)


export {app};