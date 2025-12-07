import mongoose, { type Types } from "mongoose";

export interface IUserToAdmin {
	id: Types.ObjectId;
	name: string;
	email: string;
	phone: number;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	isBlocked: boolean;
}
