export interface Department {
  id: number
  name: string
  description: string
  imageUrl: string | null
  createdBy: string
  createdAt: string
}

export interface DepartmentDetails extends Department {
  fleetManagerCount: number
  mechanicCount: number
  driverCount: number
  totalUserCount: number
}

export interface CreateDepartmentRequest {
  name: string
  description: string
  image?: File
}

export interface UpdateDepartmentRequest {
  name?: string
  description?: string
  image?: File
}