import { IUserRepository } from "../../repositories/interfaces/user.interface";

export class AdminServices {
    constructor(private _userRepo: IUserRepository) {}

    async getAllUsers(query: any) {
        try {

            const { page, limit, search, status } = query;

            const filters: any = {
                role: 'user'
            };

            if (search) {
                filters.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
                ];
            }

             if (status) filters.status = status;

            const userData = await this._userRepo.findAllUsers(filters, page, limit);
        

            return { success: true, data: userData };
        } catch (error) {
            console.error("Get all users service error:", error);
            return { success: false, message: 'Failed to fetch users', data: [] };
        }    
    }

    async blockUser(userId: string) {
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const result = await this._userRepo.updateById(userId, { 
                status: 'Blocked', 
                isBlocked: true 
            });

            return { 
                success: true, 
                message: 'User blocked successfully', 
                data: result 
            };
        } catch (error) {
            console.error("Block user service error:", error);
            return { success: false, message: 'Failed to block user' };
        }
    }

    async unBlockUser(userId: string) {
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const result = await this._userRepo.updateById(userId, { 
                status: 'Active', 
                isBlocked: false 
            });

            return { 
                success: true, 
                message: 'User unblocked successfully', 
                data: result 
            };
        } catch (error) {
            console.error("Unblock user service error:", error);
            return { success: false, message: 'Failed to unblock user' };
        }
    }

    async deleteUser(userId: string) {
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const result = await this._userRepo.deleteById(userId);

            return { 
                success: true, 
                message: 'User deleted successfully', 
                data: result 
            };
        } catch (error) {
            console.error("Delete user service error:", error);
            return { success: false, message: 'Failed to delete user' };
        }
    }
}