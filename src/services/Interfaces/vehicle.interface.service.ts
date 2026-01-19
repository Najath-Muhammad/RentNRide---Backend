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
	): Promise<{ success: boolean; message: string }>;
	getAllVehicles(
		filters?: FilterQuery<Document & IVehicle>,
		page?: number,
		limit?: number,
	): Promise<{
		success: boolean;
		message: string;
		data?: {
			data: (Document & IVehicle)[];
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>;
	approveVehicle(
		id: string,
	): Promise<{ success: boolean; message: string; data?: IVehicle }>;
	blockVehicle(id: string): Promise<{ success: boolean; message: string }>;
	unblockVehicle(id: string): Promise<{ success: boolean; message: string }>;
	getVehicleById(
		id: string,
		isPublic?: boolean,
	): Promise<{ success: boolean; message: string; data?: any }>;
	getPublicVehicles(
		page?: number,
		limit?: number,
		lat?: number,
		lon?: number,
		range?: number,
		filters?: {
			search?: string;
			category?: string[];
			fuelType?: string[];
			transmission?: string[];
			minPrice?: number;
			maxPrice?: number;
			sortBy?: string;
		},
	): Promise<{
		success: boolean;
		message: string;
		data?: {
			data: any[];
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}>;
	getMyVehicles(
		ownerId: string,
	): Promise<{ success: boolean; message: string; vehicles?: any[] }>;
	rejectVehicle(
		id: string,
		reason: string,
	): Promise<{ success: boolean; message: string }>;
	updateVehicle(
		id: string,
		ownerId: string,
		updates: Partial<IVehicle>,
	): Promise<{ success: boolean; message: string; data?: IVehicle }>;
	deleteVehicle(
		id: string,
		ownerId: string,
	): Promise<{ success: boolean; message: string }>;
}
