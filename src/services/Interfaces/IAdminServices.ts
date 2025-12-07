import type { IUser } from "../../types/user/IUser";

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
					users: IUser[];
					total: number;
					page: number;
					limit: number;
					totalPages: number;
				};
		  }
		| {
				success: boolean;
				message: string;
				data: IUser[];
		  }
	>;
	blockUser(
		userId: string,
	): Promise<
		| { success: boolean; message: string; data?: IUser | null }
		| { success: false; message: string }
	>;
	unBlockUser(
		userId: string,
	): Promise<
		| { success: boolean; message: string; data?: IUser | null }
		| { success: false; message: string }
	>;
	deleteUser(
		userId: string,
	): Promise<
		| { success: boolean; message: string; data?: any }
		| { success: false; message: string }
	>;
}
