import { httpClient } from "./httpClient";
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
} from "@/types/vehicle.types";

export const FleetManagerService = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await httpClient.get<Vehicle[]>(
      "/api/fleet-manager/vehicles"
    );
    return response.data;
  },

  getVehicleById: async (vehicleId: string): Promise<Vehicle> => {
    const response = await httpClient.get<Vehicle>(
      `/api/fleet-manager/vehicles/${vehicleId}`
    );
    return response.data;
  },

  updateVehicle: async (
    vehicleId: string,
    payload: UpdateVehicleRequest
  ): Promise<Vehicle> => {
    const response = await httpClient.put(
      `/api/fleet-manager/vehicles/${vehicleId}`,
      payload
    );
    return response.data;
  },

  updateVehicleImage: async (
    vehicleId: string,
    imageFile: File
  ): Promise<Vehicle> => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await httpClient.put<Vehicle>(
      `/api/fleet-manager/vehicles/${vehicleId}/image`,
      formData,
      {
        headers: {
          // IMPORTANT: let Axios set this automatically
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  createVehicle: async (payload: CreateVehicleRequest): Promise<Vehicle> => {
    const formData = new FormData();

    formData.append("image", payload.image);
    formData.append("plateNumber", payload.plateNumber);
    formData.append("manufacturer", payload.manufacturer);
    formData.append("model", payload.model);
    formData.append("year", String(payload.year));
    formData.append("currentMileage", String(payload.currentMileage));
    formData.append("serviceMileage", String(payload.serviceMileage));
    formData.append("status", payload.status);
    formData.append("color", payload.color);

    const response = await httpClient.post<Vehicle>(
      "/api/fleet-manager/vehicles",
      formData,
      {
        headers: {
          // Let Axios handle boundary
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
