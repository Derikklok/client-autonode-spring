import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  AddIcon,
  CheckCircle,
  Clock03Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

interface ServiceJob {
  id: string
  jobNumber: string
  vehiclePlate: string
  description: string
  status: "scheduled" | "in-progress" | "completed" | "urgent"
  priority: "low" | "medium" | "high" | "critical"
  assignedMechanic: string
  scheduledDate: string
  estimatedCost: number
  actualCost?: number
  hoursRequired: number
  dueDate: string
}

const mockServiceJobs: ServiceJob[] = [
  {
    id: "1",
    jobNumber: "JOB-2024-0847",
    vehiclePlate: "TX-4521",
    description: "Regular maintenance - Oil change, filter replacement, inspection",
    status: "in-progress",
    priority: "medium",
    assignedMechanic: "Robert Chen",
    scheduledDate: "2025-12-29",
    estimatedCost: 450,
    hoursRequired: 2,
    dueDate: "2025-12-29",
  },
  {
    id: "2",
    jobNumber: "JOB-2024-0848",
    vehiclePlate: "TX-4522",
    description: "Brake system replacement - Front and rear pads, rotor check",
    status: "completed",
    priority: "high",
    assignedMechanic: "Robert Chen",
    scheduledDate: "2025-12-27",
    estimatedCost: 820,
    actualCost: 850,
    hoursRequired: 3,
    dueDate: "2025-12-28",
  },
  {
    id: "3",
    jobNumber: "JOB-2024-0849",
    vehiclePlate: "TX-4523",
    description: "Tire replacement - All 18 tires, wheel alignment",
    status: "urgent",
    priority: "critical",
    assignedMechanic: "Available",
    scheduledDate: "2025-12-29",
    estimatedCost: 1200,
    hoursRequired: 4,
    dueDate: "2025-12-29",
  },
  {
    id: "4",
    jobNumber: "JOB-2024-0850",
    vehiclePlate: "TX-4525",
    description: "Engine diagnostic - Check error codes, valve inspection",
    status: "scheduled",
    priority: "high",
    assignedMechanic: "Pending",
    scheduledDate: "2026-01-05",
    estimatedCost: 350,
    hoursRequired: 2.5,
    dueDate: "2026-01-05",
  },
  {
    id: "5",
    jobNumber: "JOB-2024-0851",
    vehiclePlate: "TX-4524",
    description: "Transmission fluid flush and refill",
    status: "scheduled",
    priority: "medium",
    assignedMechanic: "Pending",
    scheduledDate: "2026-01-08",
    estimatedCost: 280,
    hoursRequired: 1.5,
    dueDate: "2026-01-08",
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        icon: CheckCircle,
        label: "Completed",
      }
    case "in-progress":
      return {
        color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
        icon: Clock03Icon,
        label: "In Progress",
      }
    case "scheduled":
      return {
        color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
        icon: Clock03Icon,
        label: "Scheduled",
      }
    case "urgent":
      return {
        color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
        icon: AlertCircleIcon,
        label: "Urgent",
      }
    default:
      return {
        color: "bg-slate-500/10 text-slate-700",
        icon: AlertCircleIcon,
        label: "Unknown",
      }
  }
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30"
    case "high":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30"
    case "medium":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30"
    case "low":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
    default:
      return "bg-slate-500/10 text-slate-700"
  }
}

export function FleetManagerServiceJobs({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [jobs] = useState<ServiceJob[]>(mockServiceJobs)

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesPriority = priorityFilter === "all" || job.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const completedJobs = jobs.filter((j) => j.status === "completed").length
  const inProgressJobs = jobs.filter((j) => j.status === "in-progress").length
  const urgentJobs = jobs.filter((j) => j.status === "urgent").length

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Service tasks
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressJobs}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Currently being serviced
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedJobs}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Tasks finished
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentJobs}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Needs immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Jobs */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Jobs</CardTitle>
              <CardDescription>
                Track {filteredJobs.length} maintenance tasks
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <HugeiconsIcon icon={AddIcon} className="h-4 w-4" />
              Create Job
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={`relative flex-1 ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg`}>
              <HugeiconsIcon
                icon={Search01Icon}
                className={`absolute left-3 top-3 h-5 w-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              />
              <Input
                placeholder="Search by job number, vehicle, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border-0 pl-10 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100"}`}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={`w-full sm:w-40 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className={`w-full sm:w-40 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs Table */}
          <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <Table>
              <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Mechanic</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const statusConfig = getStatusConfig(job.status)
                  return (
                    <TableRow
                      key={job.id}
                      className={isDark ? "border-white/5 hover:bg-slate-800/50" : "border-slate-200 hover:bg-slate-50"}
                    >
                      <TableCell className="font-semibold">{job.jobNumber}</TableCell>
                      <TableCell>{job.vehiclePlate}</TableCell>
                      <TableCell className="max-w-xs truncate">{job.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1 ${statusConfig.color}`}
                        >
                          <HugeiconsIcon
                            icon={statusConfig.icon}
                            className="h-3 w-3"
                          />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPriorityConfig(job.priority)}
                        >
                          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.assignedMechanic}</TableCell>
                      <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {new Date(job.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-semibold">
                            ${job.actualCost ? job.actualCost : job.estimatedCost}
                          </div>
                          {job.actualCost && job.actualCost !== job.estimatedCost && (
                            <p className={`text-xs ${job.actualCost > job.estimatedCost ? "text-red-500" : "text-emerald-500"}`}>
                              {job.actualCost > job.estimatedCost ? "+" : ""}{job.actualCost - job.estimatedCost}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="py-12 text-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                No service jobs found matching your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
