import mongoose, { type Document, Schema } from "mongoose";

export interface IReview extends Document {
	vehicleId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	bookingId: mongoose.Types.ObjectId;
	rating: number;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
	{
		vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, required: true },
	},
	{ timestamps: true },
);

ReviewSchema.index({ vehicleId: 1, userId: 1, bookingId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
