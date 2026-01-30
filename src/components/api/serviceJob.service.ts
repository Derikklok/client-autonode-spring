import { httpClient } from "./httpClient"
import type { CreateServiceJobRequest, ServiceJob, ServiceJobsResponse, ServiceJobSummary, RequiredPart } from "@/types/serviceJob.types"
import type { AdminUser } from "@/types/admin.types"

export const FleetManagerServiceJobService = {
  getAvailableMechanics: async (): Promise<AdminUser[]> => {
    const response = await httpClient.get<AdminUser[]>(
      "/api/fleet-manager/mechanics"
    )
    return response.data
  },

  createServiceJob: async (payload: CreateServiceJobRequest): Promise<ServiceJob> => {
    const response = await httpClient.post<ServiceJob>(
      "/api/fleet-manager/service-jobs",
      payload
    )
    return response.data
  },

  getServiceJobById: async (jobId: string): Promise<ServiceJob> => {
    const response = await httpClient.get<ServiceJob>(
      `/api/fleet-manager/service-jobs/${jobId}`
    )
    return response.data
  },

  getAllServiceJobs: async (page: number = 0, size: number = 20): Promise<ServiceJobsResponse> => {
    const response = await httpClient.get<ServiceJobsResponse>(
      "/api/fleet-manager/service-jobs",
      {
        params: { page, size },
      }
    )
    return response.data
  },

  getOngoingServiceJobs: async (): Promise<ServiceJob[]> => {
    const response = await httpClient.get<ServiceJob[]>(
      "/api/fleet-manager/service-jobs/ongoing"
    )
    return response.data
  },

  getCompletedServiceJobs: async (): Promise<ServiceJob[]> => {
    const response = await httpClient.get<ServiceJob[]>(
      "/api/fleet-manager/service-jobs/completed"
    )
    return response.data
  },

  getServiceJobsByStatus: async (
    status: string,
    page: number = 0,
    size: number = 20
  ): Promise<ServiceJobsResponse> => {
    const response = await httpClient.get<ServiceJobsResponse>(
      `/api/fleet-manager/service-jobs/status/${status}`,
      {
        params: { page, size },
      }
    )
    return response.data
  },

  getServiceJobsByVehicle: async (
    vehicleId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ServiceJobsResponse> => {
    const response = await httpClient.get<ServiceJobsResponse>(
      `/api/fleet-manager/service-jobs/vehicle/${vehicleId}`,
      {
        params: { page, size },
      }
    )
    return response.data
  },

  updateServiceJob: async (jobId: string, payload: Partial<ServiceJob>): Promise<ServiceJob> => {
    const response = await httpClient.put<ServiceJob>(
      `/api/fleet-manager/service-jobs/${jobId}`,
      payload
    )
    return response.data
  },

  assignAdditionalMechanics: async (jobId: string, mechanicIds: number[]): Promise<ServiceJob> => {
    const response = await httpClient.post<ServiceJob>(
      `/api/fleet-manager/service-jobs/${jobId}/mechanics`,
      mechanicIds
    )
    return response.data
  },

  addPartsToJob: async (jobId: string, parts: RequiredPart[]): Promise<ServiceJob> => {
    const response = await httpClient.post<ServiceJob>(
      `/api/fleet-manager/service-jobs/${jobId}/parts`,
      parts
    )
    return response.data
  },

  getServiceJobSummary: async (): Promise<ServiceJobSummary> => {
    const response = await httpClient.get<ServiceJobSummary>(
      "/api/fleet-manager/service-jobs/summary"
    )
    return response.data
  },
}
