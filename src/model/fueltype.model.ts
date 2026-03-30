import mongoose, { Schema } from "mongoose";

export interface IFuelType {
	name: string;
	description?: string;
	isActive: boolean;
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
