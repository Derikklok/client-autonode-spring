import { httpClient } from "./httpClient"
import type { AdminUser } from "@/types/admin.types"

export const AdminService = {
  getFleetManagers: async (): Promise<AdminUser[]> => {
    const response = await httpClient.get<AdminUser[]>(
      "/api/admin/fleet-managers"
    )
    return response.data
  },

  getMechanics: async (): Promise<AdminUser[]> => {
    const response = await httpClient.get<AdminUser[]>(
      "/api/admin/mechanics"
    )
    return response.data
  },

  getDrivers: async (): Promise<AdminUser[]> => {
    const response = await httpClient.get<AdminUser[]>(
      "/api/admin/drivers"
    )
    return response.data
  },

  getUsersByDepartmentId: async (departmentId: number): Promise<AdminUser[]> => {
    const response = await httpClient.get<AdminUser[]>(
      `/api/admin/departments/${departmentId}/users`
    )
    return response.data
  },

  assignUserToDepartment: async (userId: number, departmentId: number): Promise<AdminUser> => {
    const response = await httpClient.post<AdminUser>(
      "/api/admin/departments/assign-user",
      { userId, departmentId }
    )
    return response.data
  },

  deleteUser: async (userId: number): Promise<void> => {
    await httpClient.delete(`/api/admin/users/${userId}`)
  },

  removeUserFromDepartment: async (userId: number): Promise<void> => {
    await httpClient.delete(`/api/admin/users/${userId}/department`)
  },
}
