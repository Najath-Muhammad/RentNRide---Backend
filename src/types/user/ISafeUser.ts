import type mongoose from "mongoose";

export interface ISafeUser {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	phone: number;
	role: "admin" | "user" | "premium";
	address?: mongoose.Types.ObjectId;
	status: string;
	createdAt: Date;
	updatedAt: Date;
	isBlocked: boolean;
    profilePhoto?: string;
}
