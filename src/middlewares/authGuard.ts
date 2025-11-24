import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt-service.utils';


export const AuthGuard = (roles: Array<string>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Token missing" 
            });
        }

        console.log("enf reading: ",process.env.JWT_SECRET_KEY)

        const verify = verifyToken(token, process.env.JWT_SECRET_KEY!) as { 
            email: string; 
            userId: string; 
            role: string;
        };

        console.log("verify",verify)

        if (!verify) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token" 
            });
        }



        if (!roles.includes(verify.role)) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this resource"
            });
        }

        req.user = verify;
        next();

    } catch (error) {
        console.log("error is: ",error)
        return res.status(401).json({ 
            success: false,
            message: "Invalid or expired token" 
        });
    }
};