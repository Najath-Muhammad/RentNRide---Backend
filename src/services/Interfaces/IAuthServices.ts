
export interface UserType{
    name:string,
    email:string,
    password:string
}
export interface IAuthService {
    signup(user:UserType):Promise<object>;
    verifyOtp(otp:string,email:string):Promise<any>;
    verifyOtpFor(otp:string,email:string):Promise<{success:boolean,message:string}>;
    resetPassword(email: string, password: string): Promise<{ success: boolean; message: string }>
    resendOtp(email: string): Promise<{ success: boolean; message: string }>;
    login(email: string, password: string):Promise<{success:boolean,message:string,accessToken?:string,refreshToken?:string}>;
    logout(refreshToken: string): Promise<void>;
    verifyEmail(email:string):Promise<{success:boolean,message:string}>;
    adminLogin(email: string, password: string):Promise<{success:boolean,message:string,accessToken?:string,refreshToken?:string}>;
    googleAuth(credential: string): Promise<{
        success: boolean;
        message: string;
        user?: any;
        accessToken?: string;
        refreshToken?: string;
    }>;
    refreshToken(token: string): Promise<{ accessToken: string }>;
}   