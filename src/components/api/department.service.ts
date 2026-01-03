import { httpClient } from "./httpClient";
import type { Department, DepartmentDetails, DepartmentUser } from "@/types/department.types";

export interface CreateDepartmentPayload {
  name: string
  description: string
}

export interface UpdateDepartmentPayload {
  name: string
  description: string
}

export const DepartmentService = {
  getAll: async (): Promise<Department[]> => {
    const response = await httpClient.get<Department[]>("/api/departments")
    return response.data
  },

  getAllWithDetails: async (): Promise<DepartmentDetails[]> => {
    const response = await httpClient.get<DepartmentDetails[]>("/api/department-details")
    return response.data
  },

  getById: async (id: number): Promise<Department> => {
    const response = await httpClient.get<Department>(`/api/departments/${id}`)
    return response.data
  },

  getDetails: async (id: number): Promise<DepartmentDetails> => {
    const response = await httpClient.get<DepartmentDetails>(`/api/department-details/${id}`)
    return response.data
  },

  getUsersByDepartmentId: async (id: number): Promise<DepartmentUser[]> => {
    const response = await httpClient.get<DepartmentUser[]>(
      `/api/admin/departments/${id}/users`
    )
    return response.data
  },

  create: async (payload: CreateDepartmentPayload): Promise<Department> => {
    const response = await httpClient.post<Department>(
      "/api/departments",
      payload
    )
    return response.data
  },

  update: async (id: number, payload: UpdateDepartmentPayload): Promise<Department> => {
    const response = await httpClient.put<Department>(
      `/api/departments/${id}`,
      payload
    )
    return response.data
  },

  updateImage: async (id: number, image: File): Promise<Department> => {
    const formData = new FormData()
    formData.append("image", image)

    const response = await httpClient.put<Department>(
      `/api/departments/${id}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/api/departments/${id}`)
  },
}
