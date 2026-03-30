import type mongoose from "mongoose";
import type { Document, FilterQuery, UpdateQuery } from "mongoose";

export interface IBaseRepo<T extends Document> {
	create(data: Partial<T>): Promise<T>;
	findById(id: string | mongoose.Types.ObjectId): Promise<T | null>;
	findAll(filter?: FilterQuery<T>): Promise<T[]>;
	findOne(filter: FilterQuery<T>): Promise<T | null>;
	updateById(
		id: string | mongoose.Types.ObjectId,
		update: UpdateQuery<T>,
	): Promise<T | null>;
	deleteById(id: string | mongoose.Types.ObjectId): Promise<void>;
	deleteByFilter(filter: FilterQuery<T>): Promise<void>;
	countDocuments(filter: FilterQuery<T>): Promise<number>;
}
