export type ServiceJobPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type ServiceJobStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface RequiredPart {
  partName: string
  partNumber: string
  manufacturer: string
  quantity: number
  unitPrice: number
  description: string
  supplier: string
}

export interface CreateServiceJobRequest {
  title: string
  description: string
  instructions: string
  priority: ServiceJobPriority
  vehicleId: string
  vehicleErrorId?: string
  scheduledDate: string
  estimatedCost: number
  mechanicIds: number[]
  requiredParts: RequiredPart[]
}

export interface AssignedMechanic {
  assignmentId: string
  mechanicId: number
  mechanicName: string
  mechanicEmail: string
  assignedAt: string
  acceptedAt: string | null
  accepted: boolean
  notes: string | null
}

export interface JobPart {
  id: string
  partName: string
  partNumber: string
  manufacturer: string
  quantity: number
  unitPrice: number
  totalPrice: number
  description: string
  supplier: string
  ordered: boolean
  received: boolean
}

export interface ServiceJob {
  id: string
  jobNumber: string
  title: string
  description: string
  instructions: string
  status: ServiceJobStatus
  priority: ServiceJobPriority
  vehicleId: string
  vehiclePlateNumber: string
  vehicleManufacturer: string
  vehicleModel: string
  vehicleYear: number
  errorId: string | null
  errorCode: string | null
  errorTitle: string | null
  departmentName: string
  createdByName: string
  createdByEmail: string
  assignedMechanics: AssignedMechanic[]
  requiredParts: JobPart[]
  createdAt: string
  scheduledDate: string
  startedAt: string | null
  completedAt: string | null
  estimatedCost: number
  actualCost: number | null
  totalPartsCost: number
  completionNotes: string | null
  totalMechanics: number
  totalParts: number
  allPartsReceived: boolean
}

export interface ServiceJobsResponse {
  content: ServiceJob[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

export interface ServiceJobSummary {
  totalJobs: number
  pendingJobs: number
  inProgressJobs: number
  completedJobs: number
  cancelledJobs: number
  totalMechanicsAssigned: number
  totalPartsOrdered: number
  totalEstimatedCost: number
  totalActualCost: number
}
