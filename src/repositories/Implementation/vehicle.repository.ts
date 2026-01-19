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
			.skip(skip)
			.limit(limit)
			.sort({ createdAt: -1 })
			.exec();

		console.log("Applied query:", queryFilters);
		console.log("Found vehicles:", vehicles);

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
				.exec(); // Approved and not blocked
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

	async getPublicVehicles(
		page: number = 1,
		limit: number = 20,
		lat?: number,
		lon?: number,
		range: number = 10,
	) {
		const skip = (page - 1) * limit;
		const baseFilter: any = { isApproved: true, isActive: true };
		const filter: any = { ...baseFilter };

		if (lat !== undefined && lon !== undefined) {
			filter.location = {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [lon, lat],
					},
					$maxDistance: range * 1000, // range in km -> meters
				},
			};
		}

		let query = this.model.find(filter);

		// Apply sort only if NOT using geospatial query (which auto-sorts by distance)
		if (lat === undefined || lon === undefined) {
			query = query.sort({ createdAt: -1 });
		}

		const vehicles = await query
			.skip(skip)
			.limit(limit)
			.select("-__v -updatedAt")
			.exec();

		// For countDocuments, we cannot use $near.
		// We use a separate filter for count.
		let countFilter: any = { ...baseFilter };
		if (lat !== undefined && lon !== undefined) {
			countFilter.location = {
				$geoWithin: {
					$centerSphere: [[lon, lat], range / 6378.1], // km to radians
				},
			};
		}

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
			.sort({ createdAt: -1 })
			.exec();
	}

	async getTodaysVehicles(ownerId: string) {
		try {
			const _today = Date.now();
			const _count = this.model.find({ ownerId: ownerId });
		} catch (_error) { }
	}
}
