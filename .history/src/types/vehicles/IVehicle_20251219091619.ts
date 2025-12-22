import mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IVehicle extends Document {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    category: string;
    make: string,
    modelName: string;
    category2?: string;
    fuelType: string;
    seatingCapacity: number;
    pricePerDay: number;
    doors: number;
    images: string[];
    rcNumber: string;
    rcExpiryDate: Date;
    rcImage:st
    insuranceProvider:string;
    insurancePolicyNumber: string;
    insuranceExpiryDate: Date;
    insuranceDocument: string;
    pickupAddress: string;
    regionalContact: string;
    isApproved: boolean;
    isActive: boolean;
}