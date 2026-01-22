import type { Document, FilterQuery } from "mongoose";
import type { IVehicleRepository } from "../../repositories/interfaces/vehicle.interface";
import type { IVehicle, IVehicleStats } from "../../types/vehicles/IVehicle";
import { mapVehicleToResponse } from "../../utils/mapper/vehicleService.mapper";
import type { IVehicleService } from "../Interfaces/vehicle.interface.service";

type PaginatedVehicles = {
	data: (Document & IVehicle)[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export class VehicleService implements IVehicleService {
	constructor(private _vehicleRepo: IVehicleRepository) {}

	async createVehicle(
		vehicleData: IVehicle,
		user: { userId: string; role: string },
	) {
		try {
			if (user.role === "user") {
				const vehicles = await this._vehicleRepo.getVehiclesByOwner(
					user.userId,
				);
				if (vehicles && vehicles.length >= 5) {
					return {
						success: false,
						message:
							"Limit exceeded. Standard users can only list up to 5 vehicles. Please upgrade to Premium to add more.",
					};
				}
			}

			const res = await this._vehicleRepo.create(vehicleData);
			console.log("response from the repo", res);
			return { success: true, message: "Vehicle created successfully" };
		} catch (error) {
			console.error("Error creating vehicle in service:", error);
			const message =
				error instanceof Error
					? error.message
					: "There was an error creating the vehicle";
			return {
				success: false,
				message,
			};
		}
	}

	async getAllVehicles(
		filters: FilterQuery<Document & IVehicle> = {},
		page: number = 1,
		limit: number = 10,
	): Promise<{
		success: boolean;
		message: string;
		data?: PaginatedVehicles;
	}> {
		try {
			const response = await this._vehicleRepo.findAllVehicles(
				filters,
				page,
				limit,
			);
			console.log("this is the response in the service", response);

			if (response.total === 0) {
				return {
					success: false,
					message: "There are no vehicles matching the criteria",
				};
			}

			const mappedVehicles = response.data;

			return {
				success: true,
				message: "Vehicles retrieved successfully",
				data: {
					...response,
					data: mappedVehicles,
				},
			};
		} catch (error) {
			console.error("Error fetching vehicles:", error);
			return {
				success: false,
				message: "Something went wrong while fetching vehicles",
			};
		}
	}

	async getVehicleStats(): Promise<{
		success: boolean;
		message: string;
		data?: IVehicleStats;
	}> {
		try {
			const stats = await this._vehicleRepo.getVehicleStats();
			return {
				success: true,
				message: "Stats retrieved successfully",
				data: stats,
			};
		} catch (error) {
			console.error("Error in getVehicleStats service:", error);
			return {
				success: false,
				message: "Failed to fetch vehicle stats",
			};
		}
	}

	async approveVehicle(
		id: string,
	): Promise<{ success: boolean; message: string; data?: IVehicle }> {
		try {
			const vehicle = await this._vehicleRepo.approveVehicle(id);
			if (!vehicle) {
				return { success: false, message: "Vehicle not found" };
			}
			return {
				success: true,
				message: "Vehicle approved successfully",
				data: vehicle.toObject(),
			};
		} catch (error) {
			console.error("Error approving vehicle in service:", error);
			return { success: false, message: "Failed to approve vehicle" };
		}
	}

	async blockVehicle(
		id: string,
	): Promise<{ success: boolean; message: string }> {
		try {
			const vehicle = await this._vehicleRepo.blockVehicle(id);
			if (!vehicle) {
				return { success: false, message: "Vehicle not found" };
			}
			return { success: true, message: "Vehicle blocked successfully" };
		} catch (error) {
			console.error("Error blocking vehicle:", error);
			return { success: false, message: "Failed to block vehicle" };
		}
	}

	async unblockVehicle(
		id: string,
	): Promise<{ success: boolean; message: string }> {
		try {
			const vehicle = await this._vehicleRepo.unblockVehicle(id);
			if (!vehicle) {
				return { success: false, message: "Vehicle not found" };
			}
			return { success: true, message: "Vehicle unblocked successfully" };
		} catch (error) {
			console.error("Error unblocking vehicle:", error);
			return { success: false, message: "Failed to unblock vehicle" };
		}
	}

	async getVehicleById(
		id: string,
		isPublic: boolean = false,
	): Promise<{
		success: boolean;
		message: string;
		data?: IVehicle | Partial<IVehicle>;
	}> {
		try {
			const vehicle = await this._vehicleRepo.findById(id);
			if (!vehicle) {
				return {
					success: false,
					message: "Vehicle not found",
				};
			}
			const plainVehicle = vehicle.toObject() as IVehicle;

			const resultData = isPublic
				? mapVehicleToResponse(plainVehicle)
				: plainVehicle;

			if (!resultData) {
				return {
					success: false,
					message: "Vehicle is not available",
				};
			}

			return {
				success: true,
				message: "Vehicle retrieved successfully",
				data: resultData,
			};
		} catch (error) {
			console.error("Error in getVehicleById service:", error);
			return {
				success: false,
				message: "Failed to fetch vehicle",
			};
		}
	}

	async getPublicVehicles(
		page: number = 1,
		limit: number = 20,
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
		success: boolean;
		message: string;
		data?: {
			data: Partial<IVehicle>[];
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
	}> {
		try {
			const result = await this._vehicleRepo.getPublicVehicles(
				page,
				limit,
				lat,
				lon,
				range,
				minRange,
				filters,
			);
			console.log(`Service: Found ${result.total} vehicles from repo`);

			const mappedVehicles = result.data
				.map((v) => mapVehicleToResponse(v.toObject() as IVehicle))
				.filter(
					(vehicle): vehicle is NonNullable<typeof vehicle> => vehicle !== null,
				);

			return {
				success: true,
				message: "Public vehicles retrieved successfully",
				data: {
					data: mappedVehicles,
					total: result.total,
					page: result.page,
					limit: result.limit,
					totalPages: result.totalPages,
				},
			};
		} catch (error) {
			console.error("Error in getPublicVehicles service:", error);
			return {
				success: false,
				message: "Failed to fetch vehicles",
			};
		}
	}

	async getMyVehicles(ownerId: string): Promise<{
		success: boolean;
		message: string;
		vehicles?: Partial<IVehicle>[];
	}> {
		try {
			const vehicles = await this._vehicleRepo.getVehiclesByOwner(ownerId);

			const plainVehicles = vehicles.map((v) => v.toObject() as IVehicle);
			const mappedVehicles = plainVehicles
				.map((vehicle) => mapVehicleToResponse(vehicle))
				.filter((v): v is Partial<IVehicle> => v !== null);

			return {
				success: true,
				message: "Your vehicles retrieved successfully",
				vehicles: mappedVehicles,
			};
		} catch (error) {
			console.error("Error in getMyVehicles service:", error);
			return {
				success: false,
				message: "Failed to fetch your vehicles",
			};
		}
	}
	async rejectVehicle(
		id: string,
		reason: string,
	): Promise<{ success: boolean; message: string }> {
		try {
			const vehicle = await this._vehicleRepo.findById(id);
			if (!vehicle) {
				return { success: false, message: "Vehicle not found" };
			}
			if (vehicle.isApproved) {
				return {
					success: false,
					message: "Cannot reject an already approved vehicle",
				};
			}

			const updated = await this._vehicleRepo.updateById(id, {
				isApproved: false,
				isRejected: true,
				rejectionReason: reason,
				isActive: false,
			});

			if (!updated) {
				return { success: false, message: "Failed to reject vehicle" };
			}

			return { success: true, message: "Vehicle rejected successfully" };
		} catch (error) {
			console.error("Error rejecting vehicle:", error);
			return { success: false, message: "Server error" };
		}
	}

	async updateVehicle(
		id: string,
		ownerId: string,
		updates: Partial<IVehicle>,
	): Promise<{ success: boolean; message: string; data?: IVehicle }> {
		try {
			const vehicle = await this._vehicleRepo.findById(id);

			if (!vehicle) {
				return { success: false, message: "Vehicle not found" };
			}

			if (vehicle.ownerId.toString() !== ownerId) {
				return {
					success: false,
					message: "Unauthorized: You can only edit your own vehicles",
				};
			}
			// If the vehicle was rejected, reset the rejection status upon update
			if (vehicle.isRejected) {
				updates.isRejected = false;
				updates.rejectionReason = "";
				updates.isApproved = false; // Ensure it stays pending
			}

			const updated = await this._vehicleRepo.updateById(id, updates);

			if (!updated) {
				return { success: false, message: "Failed to update vehicle" };
			}

			return {
				success: true,
				message: "Vehicle updated successfully",
				data: updated.toObject() as IVehicle,
			};
		} catch (error) {
			console.error("Error updating vehicle:", error);
			return { success: false, message: "Server error" };
		}
	}

	async deleteVehicle(
		id: string,
		ownerId: string,
	): Promise<{ success: boolean; message: string }> {
		try {
			const vehicle = await this._vehicleRepo.findById(id);

			if (!vehicle) {
				return { success: false, message: "Vehicle not found" };
			}

			if (vehicle.ownerId.toString() !== ownerId) {
				return {
					success: false,
					message: "Unauthorized: You can only delete your own vehicles",
				};
			}

			await this._vehicleRepo.deleteById(id);

			return { success: true, message: "Vehicle deleted successfully" };
		} catch (error) {
			console.error("Error deleting vehicle:", error);
			return { success: false, message: "Server error" };
		}
	}

	async checkLimit(_userId: string) {
		try {
		} catch (_error) {}
	}
}
