import type mongoose from "mongoose";

export interface IAdminToFrontend {
	id?: string;
	name: string;
	email: string;
	role: string;
}

export interface IAdminAllUsers {
	id: mongoose.ObjectId;
	name: string;
	email: string;
	phone: number;
	status: boolean;
	isBlocked: boolean;
	createdAt: Date;
	updatedAt: Date;
}
