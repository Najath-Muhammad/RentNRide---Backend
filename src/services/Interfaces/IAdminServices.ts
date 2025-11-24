import { IUser } from "../../types/IUser";
export interface IAdminService {
    getAllUsers(query: {
        page?: number | string;
        limit?: number | string;
        search?: string;
        status?: string;
    }): Promise<{
        success: true;
        data: {
            users: IUser[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | {
        success: false;
        message: string;
        data: IUser[];
    }>;
    blockUser(userId: string): Promise<{success: true;message: string; data?: IUser|null } >;
    unBlockUser(userId: string): Promise<{ success: true; message: string; data?: IUser|null}>;
    deleteUser(userId: string): Promise<{ success: true; message: string; data?: any }>;
}