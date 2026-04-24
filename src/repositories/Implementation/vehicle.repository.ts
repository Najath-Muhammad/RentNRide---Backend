import type { Document, FilterQuery } from "mongoose";
import { VehicleModel } from "../../model/vehicle.model";
import type { IVehicle, IVehicleStats } from "../../types/vehicles/IVehicle";
import { BaseRepo } from "./base.repository";

export class VehicleRepo extends BaseRepo<Document & IVehicle> {
	constructor() {
		super(VehicleModel);
	}

	async findAllVehicles(
		filters: FilterQuery<Document & IVehicle> = {},
		page: number = 1,
		limit: number = 10,
	) {
		const skip = (page - 1) * limit;

		let queryFilters = { ...filters };
		if (filters.search) {
			const searchTerm = filters.search;
			queryFilters = {
				...filters,
				$or: [
					{ brand: { $regex: searchTerm, $options: "i" } },
					{ modelName: { $regex: searchTerm, $options: "i" } },
					{ vehicleId: { $regex: searchTerm, $options: "i" } },
				],
			};
			delete queryFilters.search;
		}

		if (queryFilters.category) {
			queryFilters.category = {
				$regex: `^${queryFilters.category}$`,
				$options: "i",
			};
		}

		const vehicles = await this.model
			.find(queryFilters)
			.populate("category", "name")
			.populate("fuelType", "name")
			.populate("ownerId", "name")
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
			.exec();

		const total = await this.model.countDocuments(queryFilters).exec();

		return {
			data: vehicles,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getVehicleStats(): Promise<IVehicleStats> {
		try {
			const totalVehicles = await this.model.countDocuments().exec();
			const pendingApproval = await this.model
				.countDocuments({ isApproved: false })
				.exec();
			const approved = await this.model
				.countDocuments({ isApproved: true, isActive: true })
				.exec();
			const blocked = await this.model
				.countDocuments({ isActive: false })
				.exec();

			return { totalVehicles, pendingApproval, approved, blocked };
		} catch (error) {
			console.log(error);
			return { totalVehicles: 0, pendingApproval: 0, approved: 0, blocked: 0 };
		}
	}

	async approveVehicle(id: string): Promise<(Document & IVehicle) | null> {
		return await this.model
			.findByIdAndUpdate(id, { isApproved: true }, { new: true })
			.exec();
	}

	async blockVehicle(id: string): Promise<(Document & IVehicle) | null> {
		return await this.model
			.findByIdAndUpdate(id, { isActive: false }, { new: true })
			.exec();
	}

	async unblockVehicle(id: string): Promise<(Document & IVehicle) | null> {
		return await this.model
			.findByIdAndUpdate(id, { isActive: true }, { new: true })
			.exec();
	}

	async findById(id: string): Promise<(Document & IVehicle) | null> {
		return await this.model
			.findById(id)
			.populate("category", "name")
			.populate("fuelType", "name")
			.populate("ownerId", "name email mobileNumber profileImage")
			.exec();
	}

	async getPublicVehicles(
		page: number = 1,
		limit: number = 20,
		lat?: number,
		lon?: number,
		range: number = 10,
		minRange?: number,
		filters?: {
			search?: string;
			category?: string[];
			category2?: string;
			fuelType?: string[];
			transmission?: string[];
			minPrice?: number;
			maxPrice?: number;
			minSeats?: number;
			doors?: number;
			sortBy?: string;
			excludeOwnerId?: string;
		},
	) {
		const skip = (page - 1) * limit;
		const baseFilter: FilterQuery<IVehicle> = {
			isApproved: true,
			isActive: true,
		};
		const filter: FilterQuery<IVehicle> = { ...baseFilter };

		if (filters) {
			if (filters.search) {
				filter.$or = [
					{ brand: { $regex: filters.search, $options: "i" } },
					{ modelName: { $regex: filters.search, $options: "i" } },
					{ pickupAddress: { $regex: filters.search, $options: "i" } },
				];
			}
			if (filters.category && filters.category.length > 0) {
				const categoryQuery = {
					$or: [
						{ category: { $in: filters.category } },
						{ category2: { $in: filters.category } },
					],
				};
				filter.$and = [...(filter.$and || []), categoryQuery];
			}
			// Filter by subcategory (e.g. SUV, Sedan) stored on the vehicle as category2
			if (filters.category2) {
				filter.category2 = filters.category2;
			}
			if (filters.fuelType && filters.fuelType.length > 0) {
				filter.fuelType = { $in: filters.fuelType };
			}
			if (filters.transmission && filters.transmission.length > 0) {
				filter.transmission = { $in: filters.transmission };
			}
			if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
				filter.pricePerDay = {};
				if (filters.minPrice !== undefined)
					filter.pricePerDay.$gte = filters.minPrice;
				if (filters.maxPrice !== undefined)
					filter.pricePerDay.$lte = filters.maxPrice;
			}
			if (filters.minSeats !== undefined) {
				filter.seatingCapacity = { $gte: filters.minSeats };
			}
			if (filters.doors !== undefined) {
				filter.doors = filters.doors;
			}
			if (filters.excludeOwnerId) {
				filter.ownerId = { $ne: filters.excludeOwnerId };
			}
		}

		const countFilter: FilterQuery<IVehicle> = { ...filter };
		if (lat !== undefined && lon !== undefined) {
			if (filters?.sortBy) {
				filter.location = {
					$geoWithin: {
						$centerSphere: [[lon, lat], range / 6378.1],
					},
				};
				countFilter.location = filter.location;
			} else {
				filter.location = {
					$near: {
						$geometry: {
							type: "Point",
							coordinates: [lon, lat],
						},
						$maxDistance: range * 1000,
						...(minRange ? { $minDistance: minRange * 1000 } : {}),
					},
				};
				countFilter.location = {
					$geoWithin: {
						$centerSphere: [[lon, lat], range / 6378.1],
					},
				};
			}
		}

		let query = this.model.find(filter);
		if (filters?.sortBy) {
			if (filters.sortBy === "price_asc") {
				query = query.sort({ pricePerDay: 1 });
			} else if (filters.sortBy === "price_desc") {
				query = query.sort({ pricePerDay: -1 });
			} else {
				query = query.sort({ createdAt: -1 });
			}
		} else if (lat === undefined || lon === undefined) {
			query = query.sort({ createdAt: -1 });
		}

		const vehicles = await query
			.populate("category", "name")
			.populate("fuelType", "name")
			.populate("ownerId", "name")
			.skip(skip)
			.limit(limit)
			.select("-__v -updatedAt")
			.exec();

		const total = await this.model.countDocuments(countFilter).exec();
		return {
			data: vehicles,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getVehiclesByOwner(ownerId: string) {
		return await this.model
			.find({ ownerId: ownerId })
			.populate("category", "name")
			.populate("fuelType", "name")
			.sort({ createdAt: -1 })
			.exec();
	}

	async getTodaysVehicles(ownerId: string) {
		try {
			const _today = Date.now();
			const _count = this.model.find({ ownerId: ownerId });
		} catch (_error) {}
	}
}
