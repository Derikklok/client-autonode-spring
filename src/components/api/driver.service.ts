import { httpClient } from "./httpClient"
import type { DriverVehicle, DriverErrorsResponse, DriverError } from "@/types/driver.types"

export const DriverService = {
  getMyVehicle: async (): Promise<DriverVehicle> => {
    const response = await httpClient.get<DriverVehicle>(
      "/api/driver/my-vehicle"
    )
    return response.data
  },

  getMyVehicleErrors: async (page: number = 0, size: number = 20): Promise<DriverErrorsResponse> => {
    const response = await httpClient.get<DriverErrorsResponse>(
      "/api/driver/my-vehicle/errors",
      {
        params: { page, size },
      }
    )
    return response.data
  },

  getMyVehicleUnresolvedErrors: async (): Promise<DriverError[]> => {
    const response = await httpClient.get<DriverError[]>(
      "/api/driver/my-vehicle/errors/unresolved"
    )
    return response.data
  },
}
