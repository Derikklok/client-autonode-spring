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
} from "lucide-react"
import { FleetManagerMonitoringService } from "@/components/api/monitoring.service"
import type { MonitoringError, ErrorSeverity } from "@/types/monitoring.types"


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center">
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
                              {errorItem.resolved ? (
                                <Badge className="border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Resolved
                                </Badge>
                              ) : (
                                <Badge className="border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Active
                                </Badge>
                              )}
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
    </div>
  )
}
