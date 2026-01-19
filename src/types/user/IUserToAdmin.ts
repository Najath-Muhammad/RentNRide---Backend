import type { Types } from "mongoose";

export interface IUserToAdmin {
	_id: Types.ObjectId;
	name: string;
	email: string;
	phone: number;
	role: string;
	status: string;
}
