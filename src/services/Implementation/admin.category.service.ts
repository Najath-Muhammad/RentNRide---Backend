// src/services/admin.service.ts

import type { ICategory } from "../../model/category.model";
import type { IFuelType } from "../../model/fueltype.model";
import type { ICategoryRepository } from "../../repositories/interfaces/category.interface";
import type { IFueltypeRepository } from "../../repositories/interfaces/fuletype.interface";
import type { IAdminCategoryService } from "../Interfaces/admin.category.interface.service";

export class AdminCategoryService implements IAdminCategoryService {
	constructor(
		private categoryRepo: ICategoryRepository,
		private fuelTypeRepo: IFueltypeRepository,
	) {}

	async getAllCategories(
		search?: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{
		data: ICategory[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		try {
			return await this.categoryRepo.findAll(search, page, limit);
		} catch (error) {
			console.error("Error fetching all categories:", error);
			throw new Error("Failed to fetch categories");
		}
	}

	async getCategoryById(id: string): Promise<ICategory> {
		try {
			const category = await this.categoryRepo.findById(id);
			if (!category) {
				throw new Error("Category not found");
			}
			return category;
		} catch (error) {
			console.error(`Error fetching category ${id}:`, error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to fetch category",
			);
		}
	}

	async createCategory(input: {
		name: string;
		description?: string;
		subCategories?: { name: string }[];
	}): Promise<ICategory> {
		try {
			const subCategories = (input.subCategories || []).map((sc) => ({
				name: sc.name.trim(),
				isActive: true,
			}));

			return await this.categoryRepo.create({
				name: input.name,
				description: input.description,
				subCategories,
			});
		} catch (error) {
			console.error("Error creating category:", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to create category",
			);
		}
	}

	async updateCategory(id: string, input: Partial<ICategory>): Promise<ICategory> {
		try {
			const updateData: Partial<ICategory> = {};

			if (input.name) updateData.name = input.name;
			if (input.description !== undefined)
				updateData.description = input.description;

			if (input.subCategories !== undefined) {
				updateData.subCategories = input.subCategories
					.filter((sc) => sc?.name?.trim())
					.map((sc) => ({
						...(sc._id && { _id: sc._id }),
						name: sc.name.trim(),
						isActive: sc.isActive ?? true,
					}));
			}

			const updated = await this.categoryRepo.updateById(id, updateData);
			if (!updated) {
				throw new Error("Category not found");
			}
			return updated;
		} catch (error) {
			console.error(`Error updating category ${id}:`, error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to update category",
			);
		}
	}

	async toggleCategoryStatus(id: string): Promise<ICategory> {
		try {
			const updated = await this.categoryRepo.toggleActive(id);
			if (!updated) {
				throw new Error("Category not found");
			}
			return updated;
		} catch (error) {
			console.error(`Error toggling category status ${id}:`, error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to toggle category status",
			);
		}
	}

	async getAllFuelTypes(): Promise<IFuelType[]> {
		try {
			return await this.fuelTypeRepo.findAll();
		} catch (error) {
			console.error("Error fetching all fuel types:", error);
			throw new Error("Failed to fetch fuel types");
		}
	}

	async createFuelType(data: Partial<IFuelType>): Promise<IFuelType> {
		try {
			return await this.fuelTypeRepo.create(data);
		} catch (error) {
			console.error("Error creating fuel type:", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to create fuel type",
			);
		}
	}

	async updateFuelType(id: string, data: Partial<IFuelType>): Promise<IFuelType> {
		try {
			const updated = await this.fuelTypeRepo.updateById(id, data);
			if (!updated) {
				throw new Error("Fuel type not found");
			}
			return updated;
		} catch (error) {
			console.error(`Error updating fuel type ${id}:`, error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to update fuel type",
			);
		}
	}

	async toggleFuelTypeStatus(id: string): Promise<IFuelType> {
		try {
			const updated = await this.fuelTypeRepo.toggleActive(id);
			if (!updated) {
				throw new Error("Fuel type not found");
			}
			return updated;
		} catch (error) {
			console.error(`Error toggling fuel type status ${id}:`, error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to toggle fuel type status",
			);
		}
	}
}
