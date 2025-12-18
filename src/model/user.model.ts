import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/user/IUser";

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: Number },
		googleId: { type: String },
		role: { type: String, enum: ["admin", "user"], default: "user" },
		address: { type: Schema.Types.ObjectId, ref: "Address" },
		subscription: { type: Schema.Types.ObjectId, ref: "Subscription" },
		wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
		rentedVehicles: { type: Schema.Types.ObjectId, ref: "Vehicle" },
		ownedVehicles: { type: Schema.Types.ObjectId, ref: "Vehicle" },
		bookingHistory: { type: Schema.Types.ObjectId, ref: "Booking" },
		paymentHistory: { type: Schema.Types.ObjectId, ref: "Payment" },
		chatList: { type: Schema.Types.ObjectId, ref: "Chat" },
		notifications: { type: Schema.Types.ObjectId, ref: "Notification" },
		status: { type: String, default: "active" },
		isBlocked: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
