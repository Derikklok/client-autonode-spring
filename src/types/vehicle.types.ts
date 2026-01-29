export type VehicleStatus = "ACTIVE" | "IN_SERVICE" | "INACTIVE"


export interface Vehicle {
  id: string
  plateNumber: string
  manufacturer: string
  model: string
  year: number
  imageUrl: string
  currentMileage: number
  serviceMileage: number
  status: VehicleStatus
  departmentName: string
  driverId: number | null
  driverName: string | null
  driverEmail: string | null
  createdAt: string
}

export interface UpdateVehicleRequest {
  plateNumber: string
  currentMileage: number
  serviceMileage: number
  status: "ACTIVE" | "IN_SERVICE" | "INACTIVE"
  manufacturer: string
  model: string
}

export interface CreateVehicleRequest {
  plateNumber: string
  manufacturer: string
  model: string
  year: number
  currentMileage: number
  serviceMileage: number
  status: "ACTIVE" | "IN_SERVICE" | "INACTIVE"
  color: string
  image: File
}

export interface AvailableDriver {
  id: number
  fullName: string | null
  email: string
  available: boolean
}

