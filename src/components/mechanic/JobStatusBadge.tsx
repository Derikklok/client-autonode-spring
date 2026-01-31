import { Badge } from "@/components/ui/badge"
import { Clock, Wrench, CheckCircle, XCircle } from "lucide-react"
import type { JobStatus } from "@/types/mechanic.types"

interface JobStatusBadgeProps {
  status: JobStatus
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case "PENDING":
        return {
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          icon: Clock,
          label: "Pending",
        }
      case "IN_PROGRESS":
        return {
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          icon: Wrench,
          label: "In Progress",
        }
      case "COMPLETED":
        return {
          className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          icon: CheckCircle,
          label: "Completed",
        }
      case "CANCELLED":
        return {
          className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          icon: XCircle,
          label: "Cancelled",
        }
      default:
        return {
          className: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
          icon: Clock,
          label: status,
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={`text-xs font-semibold flex items-center gap-1 w-fit ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
