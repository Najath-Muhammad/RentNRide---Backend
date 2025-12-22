import mongoose,{Schema} from "mongoose";
import { IVehicle } from "../types/vehicles/IVehicle";

const VehicleSchema = new Schema<IVehicle>(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User" },
        category: { type: String, required: true },
        make: { type: String, required: true },
        modelName: { type: String, required: true },
        category2: { type: String }, 
        fuelType: { type: String, required: true },
        seatingCapacity: { type: Number, required: true, min: 1, max: 50 },
        pricePerDay: { type: Number, required: true, min: 0 },
        doors: { type: Number, min: 2, max: 6 },
        images: [{ type: String, required: true }], 
        rcNumber: { type: String, required: true, unique: true },
        rcExpiryDate: { type: Date, required: true },
        rcImage:{type:String,required:true},
        insuranceProvider: { type: String, required: true },
        insurancePolicyNumber: { type: String, required: true },
        insuranceExpiryDate: { type: Date, required: true },
        insuranceDocument: { type: String }, 
        insuranceImage:{type:String,},
        pickupAddress: { type: String, required: true },
        regionalContact: { type: String, required: true },
        isApproved: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const VehicleModel = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
