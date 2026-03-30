import type { IVehicle } from "../../types/vehicles/IVehicle";

export const mapVehicleToPublicResponse = (
	vehicle: IVehicle,
): Partial<IVehicle> | null => {
	const now = new Date();

	const isRcExpired = vehicle.rcExpiryDate
		? new Date(vehicle.rcExpiryDate) < now
		: false;
	const isInsuranceExpired = vehicle.insuranceExpiryDate
		? new Date(vehicle.insuranceExpiryDate) < now
		: false;

	if (isRcExpired || isInsuranceExpired) {
		return null;
	}

	return {
		_id: vehicle._id,
		ownerId: vehicle.ownerId,
		category: vehicle.category,
		brand: vehicle.brand,
		modelName: vehicle.modelName,
		category2: vehicle.category2,
		fuelType: vehicle.fuelType,
		seatingCapacity: vehicle.seatingCapacity,
		pricePerDay: vehicle.pricePerDay,
		doors: vehicle.doors,
		vehicleImages: vehicle.vehicleImages,
		pickupAddress: vehicle.pickupAddress,
		regionalContact: vehicle.regionalContact,
		isApproved: vehicle.isApproved,
		isRejected: vehicle.isRejected,
		rejectionReason: vehicle.rejectionReason,
		isActive: vehicle.isActive,
		rcNumber: vehicle.rcNumber,
		rcExpiryDate: vehicle.rcExpiryDate,
		rcImage: vehicle.rcImage,
		insuranceProvider: vehicle.insuranceProvider,
		insurancePolicyNumber: vehicle.insurancePolicyNumber,
		insuranceExpiryDate: vehicle.insuranceExpiryDate,
		insuranceDocument: vehicle.insuranceDocument,
		insuranceImage: vehicle.insuranceImage,
	};
};

export const mapVehicleToDTO = (vehicle: IVehicle): Partial<IVehicle> => {
	return {
		_id: vehicle._id,
		ownerId: vehicle.ownerId,
		category: vehicle.category,
		brand: vehicle.brand,
		modelName: vehicle.modelName,
		category2: vehicle.category2,
		fuelType: vehicle.fuelType,
		seatingCapacity: vehicle.seatingCapacity,
		pricePerDay: vehicle.pricePerDay,
		doors: vehicle.doors,
		vehicleImages: vehicle.vehicleImages,
		pickupAddress: vehicle.pickupAddress,
		regionalContact: vehicle.regionalContact,
		isApproved: vehicle.isApproved,
		isRejected: vehicle.isRejected,
		rejectionReason: vehicle.rejectionReason,
		isActive: vehicle.isActive,
		rcNumber: vehicle.rcNumber,
		rcExpiryDate: vehicle.rcExpiryDate,
		rcImage: vehicle.rcImage,
		insuranceProvider: vehicle.insuranceProvider,
		insurancePolicyNumber: vehicle.insurancePolicyNumber,
		insuranceExpiryDate: vehicle.insuranceExpiryDate,
		insuranceDocument: vehicle.insuranceDocument,
		insuranceImage: vehicle.insuranceImage,
	};
};
