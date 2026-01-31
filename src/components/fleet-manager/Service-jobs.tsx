import { useState, useEffect } from "react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  Loader,
  Plus,
  Clock,
  CheckCheckIcon,
  Users,
  Package,
} from "lucide-react"
import { FleetManagerMonitoringService } from "@/components/api/monitoring.service"
import { FleetManagerServiceJobService } from "@/components/api/serviceJob.service"
import { ServiceJobCreationDialog } from "./ServiceJobCreationDialog"
import { ServiceJobDetailDialog } from "./ServiceJobDetailDialog"
import type { MonitoringError, ErrorSeverity } from "@/types/monitoring.types"
import type { ServiceJob } from "@/types/serviceJob.types"


export function FleetManagerServiceJobs({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<ErrorSeverity | "all">("all")
  const [resolvedFilter, setResolvedFilter] = useState("unresolved")
  const [errors, setErrors] = useState<MonitoringError[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [serviceJobDialogOpen, setServiceJobDialogOpen] = useState(false)
  const [selectedErrorForJob, setSelectedErrorForJob] = useState<MonitoringError | null>(null)
  const [jobDetailDialogOpen, setJobDetailDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  
  // Service Jobs state
  const [ongoingJobs, setOngoingJobs] = useState<ServiceJob[]>([])
  const [completedJobs, setCompletedJobs] = useState<ServiceJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)

  const fetchErrors = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await FleetManagerMonitoringService.getErrorsWithVehicleInfo(
        currentPage,
        pageSize
      )
      setErrors(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError("Failed to load errors. Please try again.")
      console.error("Error fetching monitoring errors:", err)
      setErrors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchErrors()
    fetchServiceJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const fetchServiceJobs = async () => {
    try {
      setJobsLoading(true)
      const [ongoing, completed] = await Promise.all([
        FleetManagerServiceJobService.getOngoingServiceJobs(),
        FleetManagerServiceJobService.getCompletedServiceJobs(),
      ])
      setOngoingJobs(ongoing)
      setCompletedJobs(completed)
    } catch (err) {
      console.error("Error fetching service jobs:", err)
    } finally {
      setJobsLoading(false)
    }
  }

  const filteredErrors = errors.filter((error) => {
    const matchesSearch =
      error.errorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = severityFilter === "all" || error.severity === severityFilter
    const matchesResolved =
      resolvedFilter === "all" ||
      (resolvedFilter === "unresolved" && !error.resolved) ||
      (resolvedFilter === "resolved" && error.resolved)

    return matchesSearch && matchesSeverity && matchesResolved
  })

  const criticalCount = errors.filter((e) => e.severity === "CRITICAL" && !e.resolved).length
  const moderateCount = errors.filter((e) => e.severity === "MODERATE" && !e.resolved).length
  const lowCount = errors.filter((e) => e.severity === "LOW" && !e.resolved).length
  const resolvedCount = errors.filter((e) => e.resolved).length

  const getSeverityConfig = (severity: ErrorSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return {
          color: isDark
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "bg-red-50 text-red-700 border-red-200",
          icon: AlertTriangle,
          label: "Critical",
        }
      case "MODERATE":
        return {
          color: isDark
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertCircle,
          label: "Moderate",
        }
      case "LOW":
        return {
          color: isDark
            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
            : "bg-blue-50 text-blue-700 border-blue-200",
          icon: AlertCircle,
          label: "Low",
        }
      default:
        return {
          color: isDark ? "bg-slate-500/10 text-slate-400" : "bg-slate-50 text-slate-700",
          icon: AlertCircle,
          label: "Unknown",
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCreateServiceJob = (err: MonitoringError) => {
    setSelectedErrorForJob(err)
    setServiceJobDialogOpen(true)
  }

  const handleServiceJobCreated = () => {
    // Refresh both errors and jobs lists after job creation
    fetchErrors()
    fetchServiceJobs()
  }

  const handleViewJobDetails = (jobId: string) => {
    setSelectedJobId(jobId)
    setJobDetailDialogOpen(true)
  }

  if (error) {
    return (
      <Card className={`${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"} border-red-500/50`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 ${
            isDark
              ? "border-red-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-red-950/30"
              : "border-red-200/50 bg-linear-to-br from-white via-red-50/30 to-red-100/20"
          }`}
        >
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${
              isDark ? "bg-red-500" : "bg-red-400"
            }`}
          />
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Immediate attention required
            </p>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 ${
            isDark
              ? "border-amber-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/30"
              : "border-amber-200/50 bg-linear-to-br from-white via-amber-50/30 to-amber-100/20"
          }`}
        >
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${
              isDark ? "bg-amber-500" : "bg-amber-400"
            }`}
          />
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium">Moderate Errors</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-amber-600">{moderateCount}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Needs attention soon
            </p>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 ${
            isDark
              ? "border-blue-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950/30"
              : "border-blue-200/50 bg-linear-to-br from-white via-blue-50/30 to-blue-100/20"
          }`}
        >
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${
              isDark ? "bg-blue-500" : "bg-blue-400"
            }`}
          />
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium">Low Errors</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-blue-600">{lowCount}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Minor issues
            </p>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 ${
            isDark
              ? "border-emerald-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30"
              : "border-emerald-200/50 bg-linear-to-br from-white via-emerald-50/30 to-emerald-100/20"
          }`}
        >
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${
              isDark ? "bg-emerald-500" : "bg-emerald-400"
            }`}
          />
          <CardHeader className="relative z-10 pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Completed errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Errors Table */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Errors & Diagnostics</CardTitle>
              <CardDescription>
                Monitoring {totalElements} errors across your fleet ({filteredErrors.length} displayed)
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={fetchErrors}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={`relative flex-1 ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg`}>
              <Search className={`absolute left-3 top-3 h-5 w-5 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <Input
                placeholder="Search by error code, title, vehicle plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border-0 pl-10 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100"}`}
              />
            </div>

            <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as ErrorSeverity | "all")}>
              <SelectTrigger className={`w-full sm:w-40 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="MODERATE">Moderate</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
              <SelectTrigger className={`w-full sm:w-40 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Errors Table */}
              <div
                className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}
              >
                <Table>
                  <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                    <TableRow>
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Vehicle</TableHead>
                      <TableHead className="font-semibold">Severity</TableHead>
                      <TableHead className="font-semibold">Subsystem</TableHead>
                      <TableHead className="font-semibold">Driver</TableHead>
                      <TableHead className="font-semibold">Reported</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-8 text-center">
                          <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                            No errors found matching your filters
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredErrors.map((errorItem) => {
                        const severityConfig = getSeverityConfig(errorItem.severity)
                        const Icon = severityConfig.icon
                        return (
                          <TableRow key={errorItem.errorId}>
                            <TableCell className="font-mono font-semibold">{errorItem.errorCode}</TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="truncate text-sm font-medium">{errorItem.title}</p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <p>{errorItem.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-semibold">{errorItem.plateNumber}</p>
                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  {errorItem.manufacturer} {errorItem.model} ({errorItem.year})
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`border ${severityConfig.color}`}>
                                <Icon className="mr-1 h-3 w-3" />
                                {severityConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{errorItem.subsystem}</TableCell>
                            <TableCell className="text-sm">
                              {errorItem.driverName ? (
                                <div>
                                  <p className="font-medium">{errorItem.driverName}</p>
                                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {errorItem.driverEmail}
                                  </p>
                                </div>
                              ) : (
                                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(errorItem.reportedAt)}
                            </TableCell>
                            <TableCell>
                              {errorItem.status === "IN_SERVICE" ? (
                                <Badge className="border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1">
                                  <Loader className="h-3 w-3" />
                                  In Service
                                </Badge>
                              ) : errorItem.status === "RESOLVED" ? (
                                <Badge className="border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Resolved
                                </Badge>
                              ) : (
                                <Badge className="border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleCreateServiceJob(errorItem)}
                                disabled={errorItem.status === "IN_SERVICE" || errorItem.status === "RESOLVED"}
                                className="gap-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                title={errorItem.status === "IN_SERVICE" ? "Service job already in progress" : errorItem.status === "RESOLVED" ? "Error has been resolved" : "Create a new service job"}
                              >
                                <Plus className="h-3 w-3" />
                                Create Job
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Page {currentPage + 1} of {totalPages} ({totalElements} total errors)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1 || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Service Job Creation Dialog */}
      <ServiceJobCreationDialog
        open={serviceJobDialogOpen}
        onOpenChange={setServiceJobDialogOpen}
        error={selectedErrorForJob}
        isDark={isDark}
        onCreateSuccess={handleServiceJobCreated}
      />

      {/* Ongoing Service Jobs Section */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader className={`pb-4 ${isDark ? "border-slate-800" : "border-slate-200"} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>Ongoing Service Jobs</CardTitle>
                <CardDescription>
                  {ongoingJobs.length} job{ongoingJobs.length !== 1 ? "s" : ""} in progress
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServiceJobs}
              className="gap-2"
              disabled={jobsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${jobsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : ongoingJobs.length === 0 ? (
            <div className={`p-8 rounded-lg text-center ${isDark ? "bg-slate-800/50 text-slate-400" : "bg-slate-50 text-slate-600"}`}>
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No ongoing jobs</p>
              <p className="text-sm opacity-70">All service jobs are completed</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ongoingJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`border-l-4 border-l-blue-500 cursor-pointer transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                  onClick={() => handleViewJobDetails(job.id)}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {job.jobNumber}
                        </p>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {job.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              job.status === "IN_PROGRESS"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                            {job.status === "IN_PROGRESS" ? "In Progress" : "Pending"}
                          </span>
                        </div>
                        <Badge
                          className={`${
                            job.priority === "URGENT"
                              ? "bg-red-500/20 text-red-600 dark:text-red-400"
                              : job.priority === "HIGH"
                              ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                              : job.priority === "MEDIUM"
                              ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                              : "bg-green-500/20 text-green-600 dark:text-green-400"
                          }`}
                        >
                          {job.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                            {job.totalMechanics} mechanic{job.totalMechanics !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                            {job.totalParts} part{job.totalParts !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className={`pt-2 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Est. Cost
                          </span>
                          <span className="font-semibold text-green-600">
                            ${job.estimatedCost.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Vehicle: <span className="font-mono">{job.vehiclePlateNumber}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewJobDetails(job.id)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Service Jobs Section */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader className={`pb-4 ${isDark ? "border-slate-800" : "border-slate-200"} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCheckIcon className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Completed Service Jobs</CardTitle>
                <CardDescription>
                  {completedJobs.length} job{completedJobs.length !== 1 ? "s" : ""} completed
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServiceJobs}
              className="gap-2"
              disabled={jobsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${jobsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : completedJobs.length === 0 ? (
            <div className={`p-8 rounded-lg text-center ${isDark ? "bg-slate-800/50 text-slate-400" : "bg-slate-50 text-slate-600"}`}>
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No completed jobs yet</p>
              <p className="text-sm opacity-70">Completed jobs will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                  onClick={() => handleViewJobDetails(job.id)}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {job.jobNumber}
                        </p>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {job.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                            Completed
                          </span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">
                          {job.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                            {job.totalMechanics} mechanic{job.totalMechanics !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                            {job.totalParts} part{job.totalParts !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className={`pt-2 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Est. / Actual
                            </span>
                            <span className="font-semibold text-green-600">
                              ${job.estimatedCost.toFixed(2)} / ${job.actualCost?.toFixed(2) || "N/A"}
                            </span>
                          </div>
                          {job.completedAt && (
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Completed: {new Date(job.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Vehicle: <span className="font-mono">{job.vehiclePlateNumber}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewJobDetails(job.id)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceJobCreationDialog
        open={serviceJobDialogOpen}
        onOpenChange={setServiceJobDialogOpen}
        error={selectedErrorForJob}
        isDark={isDark}
        onCreateSuccess={handleServiceJobCreated}
      />

      <ServiceJobDetailDialog
        open={jobDetailDialogOpen}
        onOpenChange={setJobDetailDialogOpen}
        jobId={selectedJobId}
        isDark={isDark}
        onJobCompleted={handleServiceJobCreated}
      />
    </div>
  )
}
