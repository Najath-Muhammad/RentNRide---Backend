import type { Document } from "mongoose";
import type { ICategory } from "../../model/category.model";
import { Category } from "../../model/category.model";
import type { ICategoryRepository } from "../interfaces/category.interface";

export class CategoryRepository implements ICategoryRepository {
	async findAll(
		search?: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{
		data: (ICategory & Document)[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		const skip = (page - 1) * limit;
		const regex = search ? new RegExp(search, "i") : null;
		const filter = regex ? { name: regex } : {};

		const data = await Category.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec();

		const total = await Category.countDocuments(filter).exec();

		return {
			data,
			total,
			page,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findById(id: string): Promise<(ICategory & Document) | null> {
		return Category.findById(id).exec();
	}

	async create(data: Partial<ICategory>): Promise<ICategory & Document> {
		return Category.create(data);
	}

	async updateById(
		id: string,
		update: Partial<ICategory>,
	): Promise<(ICategory & Document) | null> {
		return Category.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		}).exec();
	}

	async toggleActive(id: string): Promise<(ICategory & Document) | null> {
		const category = await Category.findById(id);
		if (!category) return null;
		category.isActive = !category.isActive;
		await category.save();
		return category;
	}
}
