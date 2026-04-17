import mongoose, { Schema } from "mongoose";

export interface ISubCategory {
	_id?: mongoose.Types.ObjectId;
	name: string;
	isActive: boolean;
}

export interface ICategory {
	_id: mongoose.Types.ObjectId;
	name: string;
	description?: string;
	subCategories: ISubCategory[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ _id: true },
);

const CategorySchema = new Schema<ICategory>(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
			unique: true,
		},
		description: {
			type: String,
			trim: true,
		},
		subCategories: {
			type: [SubCategorySchema],
			default: [],
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

CategorySchema.index({ name: "text" });

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
