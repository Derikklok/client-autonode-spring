import { httpClient } from "./httpClient";
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
  AvailableDriver,
} from "@/types/vehicle.types";
import type { Hub, CreateHubRequest, UpdateHubRequest } from "@/types/hub.types";

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

export const FleetManagerDriverService = {
  getAvailableDrivers: async (): Promise<AvailableDriver[]> => {
    const response = await httpClient.get<AvailableDriver[]>(
      "/api/fleet-manager/vehicles/drivers/available"
    );
    return response.data;
  },

  assignDriverToVehicle: async (
    vehicleId: string,
    driverId: number
  ): Promise<Vehicle> => {
    const response = await httpClient.post<Vehicle>(
      `/api/fleet-manager/vehicles/${vehicleId}/driver?driverId=${driverId}`
    );
    return response.data;
  },

  removeDriverFromVehicle: async (vehicleId: string): Promise<Vehicle> => {
    const response = await httpClient.delete<Vehicle>(
      `/api/fleet-manager/vehicles/${vehicleId}/driver`
    );
    return response.data;
  },
};

export const FleetManagerHubService = {
  getHubs: async (): Promise<Hub[]> => {
    const response = await httpClient.get<Hub[]>(
      "/api/fleet-manager/hubs"
    );
    return response.data;
  },

  getHubById: async (hubId: string): Promise<Hub> => {
    const response = await httpClient.get<Hub>(
      `/api/fleet-manager/hubs/${hubId}`
    );
    return response.data;
  },

  createHub: async (payload: CreateHubRequest): Promise<Hub> => {
    const response = await httpClient.post<Hub>(
      "/api/fleet-manager/hubs",
      payload
    );
    return response.data;
  },

  updateHub: async (
    hubId: string,
    payload: UpdateHubRequest
  ): Promise<Hub> => {
    const response = await httpClient.put<Hub>(
      `/api/fleet-manager/hubs/${hubId}`,
      payload
    );
    return response.data;
  },

  deleteHub: async (hubId: string): Promise<void> => {
    await httpClient.delete(`/api/fleet-manager/hubs/${hubId}`);
  },

  getVehiclesWithoutHubs: async (): Promise<Vehicle[]> => {
    const response = await httpClient.get<Vehicle[]>(
      "/api/fleet-manager/hubs/vehicles-without-hubs"
    );
    return response.data;
  },

  getAvailableHubs: async (): Promise<Hub[]> => {
    const response = await httpClient.get<Hub[]>(
      "/api/fleet-manager/hubs/available"
    );
    return response.data;
  },

  assignHubToVehicle: async (
    hubId: string,
    vehicleId: string
  ): Promise<Hub> => {
    const response = await httpClient.post<Hub>(
      "/api/fleet-manager/hubs/assign",
      {
        hubId,
        vehicleId,
      }
    );
    return response.data;
  },

  unassignHubFromVehicle: async (hubId: string): Promise<Hub> => {
    const response = await httpClient.delete<Hub>(
      `/api/fleet-manager/hubs/${hubId}/vehicle`
    );
    return response.data;
  },
};
