import type { IAdminToFrontend } from "../../types/admin/IAdminToFrontend";
import type { IUserToFrontend } from "../../types/user/IUserToFrontend";

export interface UserType {
	name: string;
	email: string;
	password: string;
}
export interface IAuthService {
	signup(user: UserType): Promise<object>;
	verifyOtp(otp: string, email: string): Promise<any>;
	verifyOtpFor(
		otp: string,
		email: string,
	): Promise<{ success: boolean; message: string }>;
	resetPassword(
		email: string,
		password: string,
	): Promise<{ success: boolean; message: string }>;
	resendOtp(email: string): Promise<{ success: boolean; message: string }>;
	login(
		email: string,
		password: string,
	): Promise<{
		success: boolean;
		message: string;
		user?: IUserToFrontend;
		accessToken?: string;
		refreshToken?: string;
	}>;
	logout(refreshToken: string): Promise<void>;
	verifyEmail(email: string): Promise<{ success: boolean; message: string }>;
	adminLogin(
		email: string,
		password: string,
	): Promise<{
		success: boolean;
		message: string;
		user?: IAdminToFrontend;
		accessToken?: string;
		refreshToken?: string;
	}>;
	googleAuth(credential: string): Promise<{
		success: boolean;
		message: string;
		user?: any;
		accessToken?: string;
		refreshToken?: string;
	}>;
	refreshToken(token: string): Promise<{ accessToken: string }>;
	checkBlocked(email:string):Promise<{success:boolean,message:string}>
}
