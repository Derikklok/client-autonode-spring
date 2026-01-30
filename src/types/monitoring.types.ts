export type ErrorSeverity = "CRITICAL" | "MODERATE" | "LOW"
export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE"
export type Subsystem = 
  | "ENGINE"
  | "TRANSMISSION"
  | "BRAKES"
  | "SUSPENSION"
  | "ELECTRICAL"
  | "COOLING"
  | "FUEL"
  | "EXHAUST"
  | "OTHER"

export interface MonitoringError {
  errorId: string
  errorCode: string
  title: string
  description: string
  severity: ErrorSeverity
  subsystem: Subsystem
  reportedAt: string
  resolved: boolean
  resolvedAt: string | null
  // Vehicle Information
  vehicleId: string
  plateNumber: string
  manufacturer: string
  model: string
  year: number
  color: string
  status: VehicleStatus
  imageUrl: string
  currentMileage: number
  serviceMileage: number
  // Driver Information
  driverName: string | null
  driverEmail: string | null
  // Hub Information
  hubSerialNumber: string | null
  hubManufacturer: string | null
  hubModelName: string | null
}

export interface PageInfo {
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  pageNumber: number
  pageSize: number
  offset: number
  unpaged: boolean
  paged: boolean
}

export interface MonitoringErrorResponse {
  content: MonitoringError[]
  pageable: PageInfo
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  numberOfElements: number
  size: number
  number: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  empty: boolean
}
