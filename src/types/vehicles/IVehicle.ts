import mongoose from "mongoose";

export interface IVehicle {
    ownerId?: mongoose.Types.ObjectId;
    category: string;
    make: string,
    model: string;
    category2?: string;
    fuelType: string;
    seatingCapacity: number;
    pricePerDay: number;
    doors: number;
    images: string[];
    rcNumber: string;
    rcExpiryDate: Date;
    insuranceProvider:string;
    insurancePolicyNumber: string;
    insuranceExpiryDate: Date;
    insuranceDocument: string;
    pickupAddress: string;
    regionalContact: string;
    isApproved: boolean;
    isActive: boolean;
}