import type { Document, FilterQuery } from "mongoose";
import type { IVehicle, IVehicleStats } from "../../types/vehicles/IVehicle";

export interface IVehicleService {
	getVehicleStats(): Promise<{
		success: boolean;
		message: string;
		data?: IVehicleStats;
	}>;
	createVehicle(
		vehicleData: IVehicle,
		user: { userId: string; role: string },
	): Promise<{ success: boolean; message: string }>;
	getAllVehicles(
		filters?: FilterQuery<Document & IVehicle>,
		page?: number,
		limit?: number,
	): Promise<{
		success: boolean;
		message: string;
		data?: {
			data: Partial<IVehicle>[];
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>;
	approveVehicle(
		id: string,
	): Promise<{ success: boolean; message: string; data?: IVehicle | Partial<IVehicle> }>;
	blockVehicle(id: string): Promise<{ success: boolean; message: string }>;
	unblockVehicle(id: string): Promise<{ success: boolean; message: string }>;
	getVehicleById(
		id: string,
		user?: { userId: string; role: string },
	): Promise<{ success: boolean; message: string; data?: IVehicle | Partial<IVehicle> }>;
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
	): Promise<{
		success: boolean;
		message: string;
		data?: {
			data: Partial<IVehicle>[];
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>;
	getMyVehicles(
		ownerId: string,
	): Promise<{ success: boolean; message: string; vehicles?: Partial<IVehicle>[] }>;
	rejectVehicle(
		id: string,
		reason: string,
	): Promise<{ success: boolean; message: string }>;
	updateVehicle(
		id: string,
		ownerId: string,
		updates: Partial<IVehicle>,
	): Promise<{ success: boolean; message: string; data?: IVehicle | Partial<IVehicle> }>;
	deleteVehicle(
		id: string,
		ownerId: string,
	): Promise<{ success: boolean; message: string }>;
}
