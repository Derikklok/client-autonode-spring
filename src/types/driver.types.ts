export interface DriverVehicle {
  id: string
  plateNumber: string
  manufacturer: string
  model: string
  year: number | null
  color: string
  imageUrl: string
  currentMileage: number
  serviceMileage: number
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
  departmentName: string
  hubSerialNumber: string | null
  hubManufacturer: string | null
  hubModelName: string | null
  totalErrors: number
  unresolvedErrors: number
  criticalErrors: number
  createdAt: string
  lastSeenAt: string
}

export type ErrorSeverity = "CRITICAL" | "MODERATE" | "LOW"
export type ErrorStatus = "PENDING" | "IN_SERVICE" | "RESOLVED"

export interface DriverError {
  id: string
  errorCode: string
  title: string
  description: string
  severity: ErrorSeverity
  status: ErrorStatus
  subsystem: string
  reportedAt: string
  resolved: boolean
  resolvedAt: string | null
  serviceJobId: string | null
  serviceJobNumber: string | null
  serviceJobStatus: string | null
}

export interface DriverErrorsResponse {
  content: DriverError[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}
