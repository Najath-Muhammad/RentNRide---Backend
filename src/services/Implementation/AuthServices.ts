import { IAuthService, UserType } from "../Interfaces/IAuthServices";
import { IUserRepository } from "../../repositories/interfaces/user.interface";
import { generateOtp } from "../../utils/otp-generate.utils";
import { hashPassword, verifyPassword } from "../../utils/password-service.utils";
import redisClient from "../../config/redis.config";
import { sendOtpMail } from "../../utils/mailer.utils";
import { generateToken, verifyToken } from "../../utils/jwt-service.utils";
import { OAuth2Client } from 'google-auth-library';
import { userDTO } from "../../utils/mapper/authService.mapper";

export class AuthService implements IAuthService {
    constructor(private _userRepo: IUserRepository){}

    async signup(user: UserType): Promise<{ success: boolean; message: string }> {
        try {
            const existingUser = await this._userRepo.findByEmail(user.email);
            if (existingUser) {
                throw new Error("User already exists");
            }

            const userData = {
                name: user.name,
                email: user.email,
                password: await hashPassword(user.password)
            };


            await redisClient.setEx(`user:${user.email}`, 600, JSON.stringify(userData));

            const otp = generateOtp();
            console.log(otp)

            await redisClient.setEx(`otp:${user.email}`, 300, otp);


            await sendOtpMail(user.email, otp);

            return { success: true, message: 'OTP sent successfully' };

        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    }

    async verifyOtp(otp: string, email: string): Promise<{ success: boolean; message: string; user?: any, accessToken: string, refreshToken: string }> {
        try {
            console.log(`Verifying OTP for email: ${email}`);

            if (!otp || !email) {
                throw new Error("OTP and email are required");
            }

            const storedOtp = await redisClient.get(`otp:${email}`);
            console.log(`Stored OTP: ${storedOtp}, Received OTP: ${otp}`);

            if (!storedOtp) {
                throw new Error("OTP has expired. Please request a new one.");
            }

            if (storedOtp !== otp) {
                throw new Error("Invalid OTP. Please try again.");
            }

            const userDataString = await redisClient.get(`user:${email}`);
            if (!userDataString) {
                throw new Error("User data not found. Please sign up again.");
            }

            const userData = JSON.parse(userDataString);


            const newUser = await this._userRepo.create(userData);
            const accessToken = generateToken(
                { userId: newUser._id, email: newUser.email, role: newUser.role },
                process.env.JWT_SECRET_KEY as string,
                60 * 15)
            const refresToken = generateToken(
                { userId: newUser._id, email: newUser.email, role: newUser.role },
                process.env.JWT_REFRESH_SECRET_KEY as string,
                60 * 60 * 24 * 7)




            await redisClient.del(`otp:${email}`);
            await redisClient.del(`user:${email}`);


            return {
                success: true,
                message: "User created successfully",
                user: userDTO(newUser),
                accessToken: accessToken,
                refreshToken: refresToken
            };

        } catch (error) {
            console.error("Verify OTP error:", error);
            throw error;
        }
    }

    async verifyOtpFor(otp:string,email:string):Promise<{success:boolean,message:string}>{
        try {
            
            console.log(`Verifying OTP for email: ${email}`);

            if (!otp || !email) {
                throw new Error("OTP and email are required");
            }

            const storedOtp = await redisClient.get(`otp:${email}`);
            console.log(`Stored OTP: ${storedOtp}, Received OTP: ${otp}`);

            if (!storedOtp) {
                throw new Error("OTP has expired. Please request a new one.");
            }

            if (storedOtp !== otp) {
                throw new Error("Invalid OTP. Please try again.");
            }

            await redisClient.del(`otp:${email}`);

            return {success:true,message:'otp validation is successful'}

        } catch (error) {
            return {success:false,message:'otp validation is failed'}
        }
    }

    async resetPassword(email: string, password: string): Promise<{ success: boolean; message: string }> {
        try {
           if (!email || !password) {
              return { success: false, message: "Email and password are required" };
           }
     
           const hashedPassword = await hashPassword(password);
     
           const updatedUser = await this._userRepo.findByEmailAndUpdate(email, hashedPassword);
     
           if (!updatedUser) {
              return { success: false, message: "User not found or password update failed" };
           }
     
           return {
              success: true,
              message: "Password changed successfully"
           };
     
        } catch (error: any) {
           console.error("Reset Password Service Error:", error);
     
           return {
              success: false,
              message: error.message || "Password reset failed. Please try again."
           };
        }
     }
    async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const userData = await redisClient.get(`user:${email}`);
            if (!userData) {
                throw new Error("User data not found. Please sign up again.");
            }

            const newOtp = generateOtp();
            console.log('new otp generated is:', newOtp)

            await redisClient.setEx(`otp:${email}`, 300, newOtp);

            await sendOtpMail(email, newOtp);

            return { success: true, message: 'New OTP sent successfully', };

        } catch (error) {
            console.error("Resend OTP error:", error);
            throw error;
        }
    }

    async login(email: string, password: string):Promise<{success:boolean,message:string,accessToken?:string,refreshToken?:string}> {
        try {
            const user = await this._userRepo.findByEmail(email);
    
            if (!user) {
                return { success: false, message: 'There is no user with this email' }
            }
    
            let passVer = await verifyPassword(user.password, password)
    
            if (!passVer) {
                return { success: false, message: 'Invalid password' }
            }
    
            const accessToken = generateToken(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET_KEY as string,
                60 * 15)
    
            const refreshToken = generateToken(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_REFRESH_SECRET_KEY as string,
                60 * 60 * 24 * 7)
    
            return { 
                success: true,
                message: 'Login successful',
                accessToken: accessToken,
                refreshToken: refreshToken
            }
    
        } catch (error) {
            throw error
        }
    }

    async logout(refreshToken: string): Promise<void> {
        try {
         
          const lookup = await redisClient.get(`refreshTokenLookup:${refreshToken}`);
      
          if (lookup) {
            const [userId, sessionId] = lookup.split(':');
      
            await redisClient.del(`refreshToken:${userId}:${sessionId}`);
      
            await redisClient.del(`refreshTokenLookup:${refreshToken}`);
      
            
          } else {
            console.warn(' Refresh token not found in Redis (may already be expired)');
          }
        }catch (error) {
          console.error(' Redis logout error:', error);
          if(error instanceof Error){
             throw error;
          }else{
             throw new Error("Failed to log out");
          }
        }
      }

    async verifyEmail(email:string):Promise<{success:boolean,message:string}>{
        try {
            
            const user = this._userRepo.findByEmail(email)
            if(!user){
                return {success:false,message:'user no existed'}
            }

            const otp = generateOtp();
            console.log(otp)

            await redisClient.setEx(`otp:${email}`, 300, otp);


            await sendOtpMail(email, otp);

            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            return { success: false, message: 'error in verifyin otp' };
        }
    }

    async adminLogin(email: string, password: string):Promise<{success:boolean,message:string,accessToken?:string,refreshToken?:string}> {
        try {
            const admin = await this._userRepo.findByEmail(email)
            console.log('admin is: ', admin)

            if (!admin) {
                return { success: false, message: 'There is no user with this email' }
            }

            if (admin.role !== 'admin') {
                return { success: false, message: 'You are not an admin' }
            }

            let passVer = await verifyPassword(admin.password, password)

            if (!passVer) {
                return { success: false, message: 'Invalid password' }
            }

            const accessToken = generateToken(
                { adminId: admin._id, email: admin.email, role: admin.role },
                process.env.JWT_SECRET_KEY as string,
                60 * 15)

            const refresToken = generateToken(
                { adminId: admin._id, email: admin.email, role: admin.role },
                process.env.JWT_REFRESH_SECRET_KEY as string,
                60 * 60 * 24 * 7)

            return { 
                    success: true,
                    message: 'Login successful',
                    accessToken:accessToken,
                    refreshToken:refresToken
                   }

        } catch (error) {
           throw error
        }
    }

    async googleAuth(credential: string): Promise<{
        success: boolean;
        message: string;
        user?: any;
        accessToken?: string;
        refreshToken?: string;
    }> {
        try {
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
    
            const payload = ticket.getPayload();
            if (!payload?.email || !payload.email_verified) {
                return { success: false, message: "Google email not verified or missing" };
            }

            let user = await this._userRepo.findByEmail(payload.email);
    
            if (user?.isBlocked) {
                return { success: false, message: "User is blocked by admin" };
            }
    
            if (!user) {
                const randomPassword = Math.random().toString(36).slice(-10); 
                const userData = {
                    name: payload.name || payload.email.split('@')[0],
                    email: payload.email,
                    password: await hashPassword(randomPassword), 
                    googleId: payload.sub,
                    avatar: payload.picture || null,
                    isVerified: true, 
                };
    
                user = await this._userRepo.create(userData);
            } else if (!user.googleId) {
                await this._userRepo.updateById(user._id, { googleId: payload.sub });
                user.googleId = payload.sub;
            }
    
            const accessToken = generateToken(
                { userId: user._id, email: user.email, role: user.role || 'user' },
                process.env.JWT_SECRET_KEY as string,
                60 * 15   
            );
    
            const refreshToken = generateToken(
                { userId: user._id, email: user.email, role: user.role || 'user' },
                process.env.JWT_REFRESH_SECRET_KEY as string,
                60 * 60 * 24 * 7
            );
    
            return {
                success: true,
                message: "Google authentication successful",
                user,
                accessToken,
                refreshToken
            };
    
        } catch (error: any) {
            console.error("Google Auth error:", error);
            return {
                success: false,
                message: error.message || "Google authentication failed"
            };
            // Do NOT re-throw — keep consistent with other methods that return { success: false, message }
        }
    }

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        try {

            let user;
            try {
                user = verifyToken(token, process.env.JWT_REFRESH_SECRET_KEY as string) as {
                    userId: string;
                    email: string;
                    role: string;
                };
                console.log("verified user is: ",user)
            } catch (err) {
                throw new Error("Invalid or expired refresh token");
            }

            const userData = await this._userRepo.findById(user.userId);
            console.log("after data fetch time: ",userData)
            if (!userData) throw new Error("User not found");

            const accessToken = generateToken(user, process.env.JWT_SECRET_KEY as string, 15 * 60 )

            return { accessToken }

        } catch (error) {
            throw error;
        }
    }

}