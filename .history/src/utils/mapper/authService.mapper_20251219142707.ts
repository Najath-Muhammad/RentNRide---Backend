import type { ISafeUser } from "../../types/user/ISafeUser";
import type { IUser } from "../../types/user/IUser";
import type { IUserToFrontend } from "../../types/user/IUserToFrontend";

export const userDTO = (user: IUser): ISafeUser => {
	return {
		_id: user._id,
		name: user.name,
		email: user.email,
		phone: user.phone,
		role: user.role,
		address: user.address,
		status: user.status,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		isBlocked: user.isBlocked,
	};
};

export const userToToken = (user: IUser): IUserToFrontend => {
	return {
		
		name: user.name,
		email: user.email,
		role: user.role,
	};
};
