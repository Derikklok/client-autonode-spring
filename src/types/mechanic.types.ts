export type JobStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type JobPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type ErrorStatus = "PENDING" | "IN_SERVICE" | "RESOLVED"

export interface MechanicJob {
  id: string
  jobNumber: string
  title: string
  description: string
  instructions: string
  status: JobStatus
  priority: JobPriority
  vehicleId: string
  vehiclePlateNumber: string
  vehicleManufacturer: string
  vehicleModel: string
  vehicleYear: number | null
  errorId: string
  errorCode: string
  errorTitle: string
  errorStatus: ErrorStatus
  assignmentId: string
  assignedAt: string
  acceptedAt: string | null
  accepted: boolean
  mechanicNotes: string | null
  totalMechanicsAssigned: number
  totalPartsRequired: number
  createdAt: string
  scheduledDate: string
  startedAt: string | null
  completedAt: string | null
  estimatedCost: number
  actualCost: number | null
}

export interface AcceptJobRequest {
  mechanicNotes?: string
}

export interface MechanicJobsResponse {
  jobs: MechanicJob[]
  totalJobs: number
  pendingJobs: number
  inProgressJobs: number
  completedJobs: number
}

export interface HubLog {
  id: string
  vehicleId: string
  vehiclePlateNumber: string
  speed: number
  fuelLevel: number
  engineTemperature: number
  recordedAt: string
}

export interface HubLogsResponse {
  content: HubLog[]
  totalElements: number
  size: number
  number: number
}
