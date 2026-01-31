import { httpClient } from "./httpClient"
import type { MechanicJob, HubLogsResponse } from "@/types/mechanic.types"

export const MechanicService = {
  getMyJobs: async (): Promise<MechanicJob[]> => {
    const response = await httpClient.get<MechanicJob[]>(
      "/api/mechanic/my-jobs"
    )
    return response.data
  },

  getMyOngoingJobs: async (): Promise<MechanicJob[]> => {
    const response = await httpClient.get<MechanicJob[]>(
      "/api/mechanic/my-jobs/ongoing"
    )
    return response.data
  },

  getMyPendingAssignments: async (): Promise<MechanicJob[]> => {
    const response = await httpClient.get<MechanicJob[]>(
      "/api/mechanic/my-jobs/pending-assignments"
    )
    return response.data
  },

  acceptJob: async (jobId: string, notes?: string): Promise<MechanicJob> => {
    const response = await httpClient.post<MechanicJob>(
      `/api/mechanic/jobs/${jobId}/accept`,
      { notes }
    )
    return response.data
  },

  startJob: async (jobId: string): Promise<MechanicJob> => {
    const response = await httpClient.post<MechanicJob>(
      `/api/mechanic/jobs/${jobId}/start`,
      {}
    )
    return response.data
  },

  updateWorkflow: async (jobId: string, notes: string): Promise<MechanicJob> => {
    const response = await httpClient.patch<MechanicJob>(
      `/api/mechanic/jobs/${jobId}/workflow`,
      { notes }
    )
    return response.data
  },

  finalizeJob: async (
    jobId: string,
    completionNotes?: string,
    actualCost?: number,
    mechanicNotes?: string
  ): Promise<MechanicJob> => {
    const response = await httpClient.post<MechanicJob>(
      `/api/mechanic/jobs/${jobId}/finalize`,
      { completionNotes, actualCost, mechanicNotes }
    )
    return response.data
  },

  declineJob: async (jobId: string, notes?: string): Promise<MechanicJob> => {
    const response = await httpClient.post<MechanicJob>(
      `/api/mechanic/jobs/${jobId}/decline`,
      { notes }
    )
    return response.data
  },

  getHubLogs: async (page: number = 0, size: number = 10): Promise<HubLogsResponse> => {
    const response = await httpClient.get<HubLogsResponse>(
      "/api/mechanic/hub-logs",
      {
        params: { page, size },
      }
    )
    return response.data
  },

  getVehicleHubLogs: async (vehicleId: string, page: number = 0, size: number = 5): Promise<HubLogsResponse> => {
    const response = await httpClient.get<HubLogsResponse>(
      `/api/mechanic/hub-logs/vehicle/${vehicleId}`,
      {
        params: { page, size },
      }
    )
    return response.data
  },
}
