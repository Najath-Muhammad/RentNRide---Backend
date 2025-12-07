import type { IAdminToFrontend } from "../../types/admin/IAdminToFrontend";
import type { IUser } from "../../types/user/IUser";
import type { IUserToAdmin } from "../../types/user/IUserToAdmin";

export const adminUserDTO = (user: IUser): IUserToAdmin => {
	return {
		id: user._id,
		name: user.name,
		email: user.email,
		phone: user.phone,
		status: user.status,
		isBlocked: user.isBlocked,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
};

export const adminToToken = (user: IUser): IAdminToFrontend => {
	return {
		name: user.name,
		email: user.email,
		role: user.role,
	};
};
