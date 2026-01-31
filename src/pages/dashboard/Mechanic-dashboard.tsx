
import { useEffect, useState } from "react"
import { AlertCircle, Clock, DollarSign, Loader2, LogOut, RefreshCw, Wrench, ChevronDown, LayoutGrid, Table2, Moon, Sun } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MechanicService } from "@/components/api/mechanic.service"
import { MechanicJobCard } from "@/components/mechanic/MechanicJobCard"
import { HubLogsViewer } from "@/components/mechanic/HubLogsViewer"
import type { MechanicJob, JobStatus } from "@/types/mechanic.types"
import { toast } from "sonner"

function MechanicDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [allJobs, setAllJobs] = useState<MechanicJob[]>([])
  const [ongoingJobs, setOngoingJobs] = useState<MechanicJob[]>([])
  const [pendingAssignments, setPendingAssignments] = useState<MechanicJob[]>([])
  
  const [loading, setLoading] = useState(true)
  const [ongoingLoading, setOngoingLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  
  const [activeFilter, setActiveFilter] = useState<"all" | JobStatus>("all")
  const [selectedJob, setSelectedJob] = useState<MechanicJob | null>(null)
  const [jobDetailOpen, setJobDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    ongoing: true,
    all: false,
    hubLogs: false,
  })

  useEffect(() => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(isDarkMode)
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [all, ongoing, pending] = await Promise.all([
        MechanicService.getMyJobs(),
        MechanicService.getMyOngoingJobs(),
        MechanicService.getMyPendingAssignments(),
      ])
      setAllJobs(all)
      setOngoingJobs(ongoing)
      setPendingAssignments(pending)
    } catch (err) {
      console.error("Failed to load jobs:", err)
      setError("Failed to load your jobs. Please try again.")
      toast.error("Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  const refreshOngoing = async () => {
    try {
      setOngoingLoading(true)
      const data = await MechanicService.getMyOngoingJobs()
      setOngoingJobs(data)
    } catch (err) {
      console.error("Failed to refresh ongoing jobs:", err)
      toast.error("Failed to refresh ongoing jobs")
    } finally {
      setOngoingLoading(false)
    }
  }

  const refreshPending = async () => {
    try {
      setPendingLoading(true)
      const data = await MechanicService.getMyPendingAssignments()
      setPendingAssignments(data)
    } catch (err) {
      console.error("Failed to refresh pending assignments:", err)
      toast.error("Failed to refresh pending assignments")
    } finally {
      setPendingLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    navigate("/")
  }

  const handleAcceptSuccess = (acceptedJob: MechanicJob) => {
    setAllJobs((prev) => prev.map((j) => (j.id === acceptedJob.id ? acceptedJob : j)))
    setPendingAssignments((prev) => prev.map((j) => (j.id === acceptedJob.id ? acceptedJob : j)))
    refreshPending()
  }

  const handleDeclineSuccess = (declinedJob: MechanicJob) => {
    setAllJobs((prev) => prev.filter((j) => j.id !== declinedJob.id))
    setPendingAssignments((prev) => prev.filter((j) => j.id !== declinedJob.id))
    refreshPending()
  }

  const handleStartSuccess = (startedJob: MechanicJob) => {
    setAllJobs((prev) => prev.map((j) => (j.id === startedJob.id ? startedJob : j)))
    setOngoingJobs((prev) => prev.map((j) => (j.id === startedJob.id ? startedJob : j)))
    refreshOngoing()
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

  const filteredAllJobs = activeFilter === "all" ? allJobs : allJobs.filter((job) => job.status === activeFilter)

  const stats = {
    total: allJobs.length,
    pending: allJobs.filter((j) => j.status === "PENDING").length,
    inProgress: allJobs.filter((j) => j.status === "IN_PROGRESS").length,
    completed: allJobs.filter((j) => j.status === "COMPLETED").length,
    pendingAssignments: pendingAssignments.length,
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
          <p className={`text-lg font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Loading your assigned jobs...
          </p>
        </div>
      </div>
    )
  }

  if (error || !allJobs) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="max-w-md w-full mx-4">
          <Card className={`border-l-4 border-l-red-500 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Error Loading Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{error}</p>
              <Button onClick={fetchAllData} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      {/* Header */}
      <div className={`text-white shadow-xl border-b-4 border-primary ${
        isDark
          ? "bg-linear-to-r from-slate-900 via-slate-800 to-slate-900"
          : "bg-linear-to-r from-slate-800 via-slate-700 to-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <div className="bg-linear-to-r from-primary to-accent p-2 rounded-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                Service Jobs
              </h1>
              <p className="text-slate-300">Manage and complete your assigned maintenance tasks</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-primary/20">
                <Button
                  variant="ghost"
                  className={`gap-2 transition-all h-9 ${
                    viewMode === "card"
                      ? "bg-primary text-white hover:bg-accent hover:text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  size="sm"
                  onClick={() => setViewMode("card")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Card
                </Button>
                <Button
                  variant="ghost"
                  className={`gap-2 transition-all h-9 ${
                    viewMode === "table"
                      ? "bg-primary text-white hover:bg-accent hover:text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <Table2 className="h-4 w-4" />
                  Table
                </Button>
              </div>
              <Button
                onClick={() => setIsDark(!isDark)}
                variant="outline"
                className="border-white text-white hover:bg-white/10 h-9"
                size="sm"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                onClick={fetchAllData}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-100 hover:bg-red-500/10"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === "all"
                ? `ring-2 ring-primary ${
                    isDark ? "bg-blue-900/20" : "bg-primary/10 border-2 border-primary"
                  }`
                : isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-2 border-slate-200"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>{stats.total}</div>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"} mt-1`}>All assigned jobs</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === "PENDING"
                ? `ring-2 ring-primary ${
                    isDark ? "bg-blue-900/20" : "bg-primary/10 border-2 border-primary"
                  }`
                : isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-2 border-slate-200"
            }`}
            onClick={() => setActiveFilter("PENDING")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>{stats.pending}</div>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"} mt-1`}>Not started</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === "IN_PROGRESS"
                ? `ring-2 ring-primary ${
                    isDark ? "bg-blue-900/20" : "bg-primary/10 border-2 border-primary"
                  }`
                : isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-2 border-slate-200"
            }`}
            onClick={() => setActiveFilter("IN_PROGRESS")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>{stats.inProgress}</div>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"} mt-1`}>Currently working</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === "COMPLETED"
                ? `ring-2 ring-primary ${
                    isDark ? "bg-blue-900/20" : "bg-primary/10 border-2 border-primary"
                  }`
                : isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-2 border-slate-200"
            }`}
            onClick={() => setActiveFilter("COMPLETED")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>{stats.completed}</div>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"} mt-1`}>Finished jobs</p>
            </CardContent>
          </Card>

          <Card
            className={`${
              stats.pendingAssignments > 0
                ? `ring-2 ring-red-500 ${isDark ? "bg-red-900/20" : "bg-red-50 border-2 border-red-200"}`
                : isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-2 border-slate-200"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Awaiting Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  stats.pendingAssignments > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {stats.pendingAssignments}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Need your decision</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Assignments Section */}
        {pendingAssignments.length > 0 && (
          <Card className={`border-l-4 border-l-red-500 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white"}`}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedSections({ ...expandedSections, pending: !expandedSections.pending })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                    Pending Assignments
                    <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                      ({pendingAssignments.length})
                    </span>
                  </CardTitle>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${expandedSections.pending ? "rotate-180" : ""}`}
                />
              </div>
              <CardDescription>Jobs assigned to you awaiting your acceptance</CardDescription>
            </CardHeader>

            {expandedSections.pending && (
              <CardContent className="space-y-4">
                {pendingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className={isDark ? "text-slate-400" : "text-slate-600"}>Loading assignments...</span>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingAssignments.map((job) => (
                      <MechanicJobCard
                        key={job.id}
                        job={job}
                        isDark={isDark}
                        onAcceptSuccess={handleAcceptSuccess}
                        onDeclineSuccess={handleDeclineSuccess}
                        onStartSuccess={handleStartSuccess}
                        onViewDetails={(job) => {
                          setSelectedJob(job)
                          setJobDetailOpen(true)
                        }}
                        showAcceptButton={true}
                        showDeclineButton={true}
                        showStartButton={false}
                        isPending={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Ongoing Jobs Section */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedSections({ ...expandedSections, ongoing: !expandedSections.ongoing })}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  Currently Working
                  <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    ({ongoingJobs.length})
                  </span>
                </CardTitle>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedSections.ongoing ? "rotate-180" : ""}`}
              />
            </div>
            <CardDescription>Jobs you are currently working on</CardDescription>
          </CardHeader>

          {expandedSections.ongoing && (
            <CardContent className="space-y-4">
              {ongoingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-600 dark:text-amber-400 mr-2" />
                  <span className={isDark ? "text-slate-400" : "text-slate-600"}>Loading ongoing jobs...</span>
                </div>
              ) : ongoingJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className={`h-12 w-12 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                  <p className={`text-lg font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    No jobs in progress
                  </p>
                  <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Start a job to see it here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ongoingJobs.map((job) => (
                    <MechanicJobCard
                      key={job.id}
                      job={job}
                      isDark={isDark}
                      onAcceptSuccess={handleAcceptSuccess}
                      onStartSuccess={handleStartSuccess}
                      onViewDetails={(job) => {
                        setSelectedJob(job)
                        setJobDetailOpen(true)
                      }}
                      showAcceptButton={false}
                      showStartButton={false}
                      isPending={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* All Jobs Section */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedSections({ ...expandedSections, all: !expandedSections.all })}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                All Jobs
                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                  ({filteredAllJobs.length})
                </span>
              </CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.all ? "rotate-180" : ""}`} />
            </div>
            <CardDescription>
              {activeFilter === "all" ? "View all your assigned jobs" : `Showing ${activeFilter} jobs`}
            </CardDescription>
          </CardHeader>

          {expandedSections.all && (
            <CardContent className="space-y-4">
              {filteredAllJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className={`h-12 w-12 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                  <p className={`text-lg font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    No jobs assigned
                  </p>
                  <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {activeFilter === "all"
                      ? "You don't have any assigned jobs yet"
                      : `No ${activeFilter.toLowerCase()} jobs at the moment`}
                  </p>
                </div>
              ) : viewMode === "card" ? (
                <div className="grid gap-4">
                  {filteredAllJobs.map((job) => (
                    <MechanicJobCard
                      key={job.id}
                      job={job}
                      isDark={isDark}
                      onAcceptSuccess={handleAcceptSuccess}
                      onDeclineSuccess={handleDeclineSuccess}
                      onStartSuccess={handleStartSuccess}
                      onViewDetails={(job) => {
                        setSelectedJob(job)
                        setJobDetailOpen(true)
                      }}
                      showAcceptButton={job.status === "PENDING" && !job.accepted}
                      showDeclineButton={job.status === "PENDING" && !job.accepted}
                      showStartButton={job.accepted && job.status === "PENDING"}
                      isPending={job.status === "PENDING" && !job.accepted}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <th className="px-4 py-3 text-left font-semibold">Job Title</th>
                        <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Priority</th>
                        <th className="px-4 py-3 text-left font-semibold">Cost</th>
                        <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
                        <th className="px-4 py-3 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllJobs.map((job, idx) => (
                        <tr
                          key={job.id}
                          className={`border-b transition-colors ${
                            isDark
                              ? `border-slate-800 ${idx % 2 === 0 ? "bg-slate-900" : "bg-slate-800/50"} hover:bg-slate-800`
                              : `border-slate-200 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`
                          }`}
                        >
                          <td className="px-4 py-3 font-medium">{job.title}</td>
                          <td className="px-4 py-3 text-sm">{job.vehiclePlateNumber}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                job.status === "PENDING"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : job.status === "IN_PROGRESS"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : job.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{job.priority}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                              {job.estimatedCost.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(job.scheduledDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedJob(job)
                                setJobDetailOpen(true)
                              }}
                              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Hub Logs Section */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setExpandedSections({ ...expandedSections, hubLogs: !expandedSections.hubLogs })}
          >
            <div className="flex items-center justify-between">
              <CardTitle>Hub Telemetry Data</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.hubLogs ? "rotate-180" : ""}`} />
            </div>
            <CardDescription>View vehicle diagnostic and telemetry information from OBD hubs</CardDescription>
          </CardHeader>
          {expandedSections.hubLogs && (
            <CardContent>
              <HubLogsViewer isDark={isDark} />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && jobDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setJobDetailOpen(false)} />
          <Card
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-white"}`}
          >
            <CardHeader className="sticky top-0 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-primary/20 dark:border-primary/30">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-1">
                    <Wrench className="h-5 w-5" />
                    {selectedJob.title}
                  </CardTitle>
                  <CardDescription className="text-blue-100">{selectedJob.jobNumber}</CardDescription>
                </div>
                <button
                  onClick={() => setJobDetailOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}>Status</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold`}>
                    {selectedJob.status}
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                    Priority
                  </p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold`}>
                    {selectedJob.priority}
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Vehicle</h3>
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Plate</p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {selectedJob.vehiclePlateNumber}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Manufacturer</p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {selectedJob.vehicleManufacturer}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Model</p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {selectedJob.vehicleModel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Information */}
              <div>
                <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Error Details</h3>
                <div className={`p-3 rounded-lg border-l-4 border-l-red-500 ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Error Code</p>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedJob.errorCode}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Error Title</p>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedJob.errorTitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Description</h3>
                <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {selectedJob.description}
                </p>
              </div>

              {/* Instructions */}
              <div>
                <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Instructions</h3>
                <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {selectedJob.instructions}
                </p>
              </div>

              {/* Timeline */}
              <div>
                <h3 className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Timeline</h3>
                <div className={`space-y-2 p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? "text-slate-400" : "text-slate-600"}>Assigned</span>
                    <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {formatDate(selectedJob.assignedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? "text-slate-400" : "text-slate-600"}>Scheduled</span>
                    <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {formatDate(selectedJob.scheduledDate)}
                    </span>
                  </div>
                  {selectedJob.acceptedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? "text-slate-400" : "text-slate-600"}>Accepted</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {formatDate(selectedJob.acceptedAt)}
                      </span>
                    </div>
                  )}
                  {selectedJob.startedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? "text-slate-400" : "text-slate-600"}>Started</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {formatDate(selectedJob.startedAt)}
                      </span>
                    </div>
                  )}
                  {selectedJob.completedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? "text-slate-400" : "text-slate-600"}>Completed</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {formatDate(selectedJob.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Costs */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                  <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                    Estimated Cost
                  </p>
                  <p className={`text-lg font-bold flex items-center ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    {selectedJob.estimatedCost.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                  <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                    Actual Cost
                  </p>
                  <p className={`text-lg font-bold flex items-center ${isDark ? "text-green-400" : "text-green-600"}`}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    {selectedJob.actualCost ? selectedJob.actualCost.toFixed(2) : "—"}
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Mechanics Assigned</p>
                    <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {selectedJob.totalMechanicsAssigned}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>Parts Required</p>
                    <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {selectedJob.totalPartsRequired}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedJob.mechanicNotes && (
                <div>
                  <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Your Notes</h3>
                  <div className={`p-3 rounded-lg border-l-4 border-l-blue-500 ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                    <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>{selectedJob.mechanicNotes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t dark:border-slate-800">
                <Button onClick={() => setJobDetailOpen(false)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MechanicDashboard

