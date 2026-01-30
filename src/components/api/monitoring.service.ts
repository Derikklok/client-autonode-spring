import { httpClient } from "./httpClient"
import type { MonitoringErrorResponse } from "@/types/monitoring.types"

export const FleetManagerMonitoringService = {
  getErrorsWithVehicleInfo: async (
    page: number = 0,
    size: number = 20
  ): Promise<MonitoringErrorResponse> => {
    const response = await httpClient.get<MonitoringErrorResponse>(
      "/api/fleet-manager/monitoring/errors-with-vehicle-info",
      {
        params: {
          page,
          size,
        },
      }
    )
    return response.data
  },
}
