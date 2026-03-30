import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IUser extends Document {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	password: string;
	phone: number;
	profilePhoto?: string;
	googleId?: string;
	role: "admin" | "user" | "premium";
	address?: mongoose.Types.ObjectId;
	subscription?: mongoose.Types.ObjectId;
	wallet?: mongoose.Types.ObjectId;
	rentedVehicles?: mongoose.Types.ObjectId;
	ownedVehicles?: mongoose.Types.ObjectId;
	bookingHistory?: mongoose.Types.ObjectId;
	paymentHistory?: mongoose.Types.ObjectId;
	chatList?: mongoose.Types.ObjectId;
	notifications?: mongoose.Types.ObjectId;
	status: string;
	premiumExpiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	isBlocked: boolean;
}
