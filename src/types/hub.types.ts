export interface Hub {
  id: string
  serialNumber: string
  manufacturer: string
  modelName: string
  supplierName: string
  vehiclePlateNumber: string | null
  departmentName: string
  createdAt: string
}

export interface CreateHubRequest {
  serialNumber: string
  manufacturer: string
  modelName: string
  supplierName: string
  vehiclePlateNumber?: string
  departmentName?: string
}

export interface UpdateHubRequest {
  serialNumber?: string
  manufacturer?: string
  modelName?: string
  supplierName?: string
  vehiclePlateNumber?: string | null
  departmentName?: string
}
