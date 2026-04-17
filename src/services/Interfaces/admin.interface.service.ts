import type { IUserToAdmin } from "../../types/user/IUserToAdmin";

export interface IAdminService {
	getAllUsers(query: {
		page?: number | string;
		limit?: number | string;
		search?: string;
		status?: string;
	}): Promise<
		| {
				success: boolean;
				message?: string;
				data: {
					users: IUserToAdmin[];
					total: number;
					page: number;
					limit: number;
					totalPages: number;
				};
		  }
		| {
				success: boolean;
				message: string;
				data: IUserToAdmin[];
		  }
	>;
	blockUser(
		userId: string,
	): Promise<
		| { success: boolean; message: string; data?: IUserToAdmin | null }
		| { success: false; message: string }
	>;
	unBlockUser(
		userId: string,
	): Promise<
		| { success: boolean; message: string; data?: IUserToAdmin | null }
		| { success: false; message: string }
	>;
	deleteUser(
		userId: string,
	): Promise<
		| { success: boolean; message: string; data?: undefined }
		| { success: false; message: string }
	>;
	getDashboardStats(query?: {
		startDate?: string;
		endDate?: string;
	}): Promise<{ success: boolean; data: unknown }>;
}
