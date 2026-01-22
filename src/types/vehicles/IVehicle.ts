import type mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IVehicle extends Document {
	_id: mongoose.Types.ObjectId;
	ownerId: mongoose.Types.ObjectId;
	category: mongoose.Types.ObjectId;
	brand: string;
	modelName: string;
	category2?: mongoose.Types.ObjectId;
	fuelType: mongoose.Types.ObjectId;
	transmission: "Manual" | "Automatic";
	seatingCapacity?: number;
	pricePerDay: number;
	doors: number;
	vehicleImages: string[];
	rcNumber: string;
	rcExpiryDate: Date;
	rcImage: string;
	insuranceProvider: string;
	insurancePolicyNumber: string;
	insuranceExpiryDate: Date;
	insuranceDocument: string;
	insuranceImage: string;
	pickupAddress: string;
	location?: {
		type: string;
		coordinates: number[];
	};
	regionalContact: string;
	isApproved: boolean;
	isRejected: boolean;
	rejectionReason: string;
	isActive: boolean;
}

export interface IVehicleStats {
	totalVehicles: number;
	pendingApproval: number;
	approved: number;
	blocked: number;
}
