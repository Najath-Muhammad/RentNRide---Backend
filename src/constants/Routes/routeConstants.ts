export const ROUTES = {
	AUTH: {
		BASE: "/api/auth",

		SIGNUP: "/signup",
		VERIFY_OTP: "/verify-otp",
		RESEND_OTP: "/resend-otp",
		LOGIN: "/login",
		LOGOUT: "/logout",
		GOOGLE: "/google",
		REFRESH_TOKEN: "/refresh",

		FORGOT_PASSWORD: "/forgot-password",
		VERIFY_OTP_FORGOT: "/verify-otp-forgot",
		RESET_PASSWORD: "/reset-password",

		ME: "/me",
	},
	ADMIN: {
		BASE: "/api/admin",

		LOGIN: "/login",
		LOGOUT: "/logout",

		GET_USERS: "/users",
		BLOCK_USER: "/users/:userId/block",
		UNBLOCK_USER: "/users/:userId/unblock",
		DELETE_USER: "/users/delete/:userId",
	},
};
