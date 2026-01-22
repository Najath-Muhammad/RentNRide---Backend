import type { IAdminToFrontend } from "../../types/admin/IAdmin";
import type { IUser } from "../../types/user/IUser";
import type { IUserToAdmin } from "../../types/user/IUserToAdmin";

export const adminUserDTO = (user: IUser): IUserToAdmin => {
	return {
		_id: user._id,
		name: user.name,
		email: user.email,
		phone: user.phone,
		role: user.role,
		status: user.status,
	};
};

export const adminToToken = (user: IUser): IAdminToFrontend => {
	return {
		name: user.name,
		email: user.email,
		role: user.role,
	};
};
