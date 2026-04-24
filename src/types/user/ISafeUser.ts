import type mongoose from "mongoose";
import type { Role } from "../../constants/roles";

export interface ISafeUser {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	phone: number;
	role: Role;

	address?: mongoose.Types.ObjectId;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	isBlocked: boolean;
	profilePhoto?: string;
}
