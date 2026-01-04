import { httpClient } from "./httpClient";
import type { Vehicle } from "@/types/vehicle.types";

export const FleetManagerService = {
    getVehicles: async () : Promise<Vehicle[]> => {
        const response = await httpClient.get<Vehicle[]>(
            "/api/fleet-manager/vehicles"
        )
        return response.data
    },

    getVehicleById: async (vehicleId:string) : Promise<Vehicle> =>{
        const response = await httpClient.get<Vehicle>(
            `/api/fleet-manager/vehicles/${vehicleId}`
        )
        return response.data
    }
}