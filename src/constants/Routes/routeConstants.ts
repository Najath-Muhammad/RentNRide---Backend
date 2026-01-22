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
		CHANGE_PASSWORD: "/change-password",
	},
	ADMIN: {
		BASE: "/api/admin",

		LOGIN: "/login",
		LOGOUT: "/logout",

		GET_USERS: "/users",
		BLOCK_USER: "/users/:userId/block",
		UNBLOCK_USER: "/users/:userId/unblock",
		DELETE_USER: "/users/delete/:userId",

		// Vehicle Management
		GET_VEHICLES: "/vehicles",
		GET_VEHICLE_STATS: "/vehicles/stats",
		APPROVE_VEHICLE: "/vehicles/:id/approve",
		BLOCK_VEHICLE: "/vehicles/:id/block",
		UNBLOCK_VEHICLE: "/vehicles/:id/unblock",
		GET_VEHICLE_BY_ID: "/vehicles/:id",
		REJECT_VEHICLE: "/vehicles/:id/reject",
	},
	VEHICLE: {
		BASE: "/api/vehicles",

		CREATE_VEHICLE: "/createVehicle",
		MY_VEHICLES: "/my-vehicles",
		GET_PUBLIC_VEHICLES: "/",
		GET_VEHICLE_BY_ID: "/:id",
		UPDATE_VEHICLE: "/:id",
		DELETE_VEHICLE: "/:id",
	},
	FILE: {
		BASE: "/api/files",

		GENERATE_UPLOAD_URL: "/generate-upload-url",
	},
};
