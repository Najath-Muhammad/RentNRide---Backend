import type { Document } from "mongoose";
import type { ICategory } from "../../model/category.model";

export interface ICategoryRepository {
	findAll(
		search?: string,
		page?: number,
		limit?: number,
	): Promise<{
		data: (ICategory & Document)[];
		total: number;
		page: number;
		totalPages: number;
	}>;
	findById(id: string): Promise<(ICategory & Document) | null>;
	create(data: Partial<ICategory>): Promise<ICategory & Document>;
	updateById(
		id: string,
		update: Partial<ICategory>,
	): Promise<(ICategory & Document) | null>;
	toggleActive(id: string): Promise<(ICategory & Document) | null>;
}
