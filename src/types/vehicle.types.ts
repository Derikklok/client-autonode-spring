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
  driverId: string | null
  driverName: string | null
  createdAt: string
}