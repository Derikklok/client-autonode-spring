import { Badge } from "@/components/ui/badge"
import type { JobPriority } from "@/types/mechanic.types"

interface JobPriorityBadgeProps {
  priority: JobPriority
}

export function JobPriorityBadge({ priority }: JobPriorityBadgeProps) {
  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
      case "HIGH":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
      case "URGENT":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
    }
  }

  return (
    <Badge variant="outline" className={`text-xs font-semibold ${getPriorityColor(priority)}`}>
      {priority}
    </Badge>
  )
}
