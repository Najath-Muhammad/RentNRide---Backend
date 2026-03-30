import type { Document, FilterQuery } from "mongoose";
import type { IVehicle, IVehicleStats } from "../../types/vehicles/IVehicle";
import type { IBaseRepo } from "./base.interface";

export interface IVehicleRepository extends IBaseRepo<IVehicle> {
	getVehicleStats(): Promise<IVehicleStats>;
	findAllVehicles(
		filters?: FilterQuery<Document & IVehicle>,
		page?: number,
		limit?: number,
	): Promise<{
		data: (Document & IVehicle)[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;
	approveVehicle(id: string): Promise<(Document & IVehicle) | null>;
	blockVehicle(id: string): Promise<(Document & IVehicle) | null>;
	unblockVehicle(id: string): Promise<(Document & IVehicle) | null>;
	getPublicVehicles(
		page?: number,
		limit?: number,
		lat?: number,
		lon?: number,
		range?: number,
		minRange?: number,
		filters?: {
			search?: string;
			category?: string[];
			fuelType?: string[];
			transmission?: string[];
			minPrice?: number;
			maxPrice?: number;
			sortBy?: string;
			excludeOwnerId?: string;
		},
	): Promise<{
		data: (Document & IVehicle)[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}>;
	getVehiclesByOwner(ownerId: string): Promise<(Document & IVehicle)[]>;
}
