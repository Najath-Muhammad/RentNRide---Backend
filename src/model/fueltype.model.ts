import mongoose, { Schema } from "mongoose";

export interface IFuelType {
	_id: mongoose.Types.ObjectId;
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const FuelTypeSchema = new Schema<IFuelType>(
	{
		name: {
			type: String,
			required: [true, "Fuel type name is required"],
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

FuelTypeSchema.index({ name: "text" });

export const FuelType = mongoose.model<IFuelType>("FuelType", FuelTypeSchema);
