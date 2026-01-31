
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  RefreshCw,
  Car,
  Gauge,
  Clock,
  MapPin,
  Zap,
  Eye,
  LogOut,
  History,
  CheckCircle2,
  Moon,
  Sun,
} from "lucide-react"
import { DriverService } from "@/components/api/driver.service"
import { useAuth } from "@/hooks/useAuth"
import type { DriverVehicle, DriverError } from "@/types/driver.types"
import { toast } from "sonner"

function DriverDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  
  const [vehicle, setVehicle] = useState<DriverVehicle | null>(null)
  const [errors, setErrors] = useState<DriverError[]>([])
  const [unresolvedErrors, setUnresolvedErrors] = useState<DriverError[]>([])
  const [loading, setLoading] = useState(true)
  const [errorsLoading, setErrorsLoading] = useState(false)
  const [unresolvedLoading, setUnresolvedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check system preference for dark mode
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(isDarkMode)
    fetchVehicleInfo()
    fetchVehicleErrors()
    fetchUnresolvedErrors()
  }, [])

  const fetchVehicleInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DriverService.getMyVehicle()
      setVehicle(data)
    } catch (err) {
      console.error("Failed to load vehicle information:", err)
      setError("Failed to load vehicle information. Please try again.")
      toast.error("Failed to load vehicle information")
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleErrors = async () => {
    try {
      setErrorsLoading(true)
      const data = await DriverService.getMyVehicleErrors()
      setErrors(data.content)
    } catch (err) {
      console.error("Failed to load vehicle errors:", err)
      toast.error("Failed to load vehicle error history")
    } finally {
      setErrorsLoading(false)
    }
  }

  const fetchUnresolvedErrors = async () => {
    try {
      setUnresolvedLoading(true)
      const data = await DriverService.getMyVehicleUnresolvedErrors()
      setUnresolvedErrors(data)
    } catch (err) {
      console.error("Failed to load unresolved errors:", err)
      toast.error("Failed to load unresolved errors")
    } finally {
      setUnresolvedLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    navigate("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
      case "IN_SERVICE":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
      case "PENDING":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
      default:
        return "bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "border-l-red-500 text-red-700 dark:text-red-400"
      case "MODERATE":
        return "border-l-amber-500 text-amber-700 dark:text-amber-400"
      case "LOW":
        return "border-l-blue-500 text-blue-700 dark:text-blue-400"
      default:
        return "border-l-slate-500 text-slate-700 dark:text-slate-400"
    }
  }

  const getMileageProgress = () => {
    if (!vehicle) return 0
    return (vehicle.currentMileage / vehicle.serviceMileage) * 100
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

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"} p-6 flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading vehicle information...</p>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"} p-6`}>
        <div className="max-w-4xl mx-auto">
          <Card className={`${isDark ? "border-red-500/30 bg-red-500/10" : "border-red-200 bg-red-50"}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className={isDark ? "text-red-400" : "text-red-700"}>
                  {error || "Failed to load vehicle information"}
                </p>
              </div>
              <Button onClick={fetchVehicleInfo} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-r from-primary to-accent p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Vehicle Dashboard</h1>
                <p className="text-slate-300 mt-1">Manage and monitor your assigned vehicle</p>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <Button
                onClick={() => setIsDark(!isDark)}
                variant="outline"
                className="border-white text-white hover:bg-white/10 h-9"
                size="sm"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  fetchVehicleInfo()
                  fetchVehicleErrors()
                  fetchUnresolvedErrors()
                }}
                className="text-white border-white hover:bg-white/10 h-9"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white h-9"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Vehicle Card */}
        <Card className={isDark ? "bg-slate-900 border-white/10" : "bg-white border-2 border-slate-200"}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Image */}
              <div className="lg:col-span-1 flex items-center justify-center">
                <div className={`w-full h-64 rounded-lg overflow-hidden border-2 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-100"}`}>
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.manufacturer} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src =
                        "https://images.unsplash.com/photo-1494976866556-6b2006083a04?w=400&h=300&fit=crop"
                    }}
                  />
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title and Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {vehicle.manufacturer} {vehicle.model}
                    </h2>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {vehicle.plateNumber}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(vehicle.status)} border`}>
                    {vehicle.status}
                  </Badge>
                </div>

                <Separator className={isDark ? "bg-slate-700" : ""} />

                {/* Vehicle Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>Year</p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {vehicle.year || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-4 w-4 rounded border"
                        style={{
                          backgroundColor: vehicle.color.toLowerCase(),
                          borderColor: isDark ? "#475569" : "#d1d5db",
                        }}
                      />
                      <p className={`font-semibold capitalize ${isDark ? "text-white" : "text-slate-900"}`}>
                        {vehicle.color}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                      {vehicle.departmentName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Last seen: {formatDate(vehicle.lastSeenAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mileage & Service Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mileage Card */}
          <Card className={isDark ? "bg-slate-900 border-white/10" : "bg-white border-2 border-slate-200"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                Mileage Status
              </CardTitle>
              <CardDescription>Service due tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={isDark ? "text-slate-300" : "text-slate-700"}>Current</span>
                  <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {vehicle.currentMileage.toLocaleString()} km
                  </span>
                </div>
                <div
                  className={`w-full h-3 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                >
                  <div
                    className="h-full bg-linear-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${Math.min(getMileageProgress(), 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Service due at
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {vehicle.serviceMileage.toLocaleString()} km
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <span className="font-semibold">
                    {Math.max(0, vehicle.serviceMileage - vehicle.currentMileage).toLocaleString()} km
                  </span>{" "}
                  remaining until service due
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hub Status Card */}
          <Card className={isDark ? "bg-slate-900 border-white/10" : "bg-white border-2 border-slate-200"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                Diagnostic Hub
              </CardTitle>
              <CardDescription>OBD diagnostic device status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicle.hubSerialNumber ? (
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>Serial Number</p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {vehicle.hubSerialNumber}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>Device</p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {vehicle.hubManufacturer} {vehicle.hubModelName}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 w-fit">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2" />
                    Connected
                  </Badge>
                </div>
              ) : (
                <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? "border-slate-600 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    No diagnostic hub assigned to this vehicle yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Critical Errors */}
          <Card
            className={`border-l-4 border-l-red-500 border-2 border-t-0 border-r-0 border-b-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Critical Errors</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{vehicle.criticalErrors}</p>
                </div>
                <AlertOctagon className="h-8 w-8 text-red-500 opacity-50" />
              </div>
              {vehicle.criticalErrors > 0 && (
                <p className={`text-xs mt-3 ${isDark ? "text-red-400" : "text-red-600"}`}>
                  ⚠️ Immediate attention required
                </p>
              )}
            </CardContent>
          </Card>

          {/* Unresolved Errors */}
          <Card
            className={`border-l-4 border-l-amber-500 border-2 border-t-0 border-r-0 border-b-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Unresolved Errors</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{vehicle.unresolvedErrors}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
              {vehicle.unresolvedErrors > 0 && (
                <p className={`text-xs mt-3 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                  Awaiting service job
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Errors */}
          <Card
            className={`border-l-4 border-l-blue-500 border-2 border-t-0 border-r-0 border-b-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Total Errors</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{vehicle.totalErrors}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
              <p className={`text-xs mt-3 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                All-time detected errors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Unresolved Errors Alert Section */}
        {unresolvedErrors.length > 0 && (
          <Card className={`border-l-4 border-l-red-500 border-2 border-t-0 border-r-0 border-b-0 ${isDark ? "bg-red-500/10 border-slate-900" : "bg-red-50 border-red-200"}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? "text-red-400" : "text-red-600"}`}>
                <AlertCircle className="h-5 w-5" />
                Active Issues ({unresolvedErrors.length})
              </CardTitle>
              <CardDescription className={isDark ? "" : "text-slate-600"}>
                Errors requiring immediate attention - create a service job to resolve
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unresolvedLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-red-500 mr-2" />
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading unresolved errors...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unresolvedErrors.map((err) => (
                    <div
                      key={err.id}
                      className={`p-4 rounded-lg border ${
                        err.severity === "CRITICAL"
                          ? isDark
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-red-200 bg-red-50"
                          : err.severity === "MODERATE"
                            ? isDark
                              ? "border-amber-500/30 bg-amber-500/5"
                              : "border-amber-200 bg-amber-50"
                            : isDark
                              ? "border-blue-500/30 bg-blue-500/5"
                              : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                              {err.title}
                            </p>
                            <Badge
                              className={`text-xs ${
                                err.severity === "CRITICAL"
                                  ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                                  : err.severity === "MODERATE"
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                    : "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
                              }`}
                            >
                              {err.severity}
                            </Badge>
                          </div>
                          <p className={`text-sm mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {err.description}
                          </p>
                          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                            {err.errorCode} • {err.subsystem} • Reported {formatDate(err.reportedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vehicle Timeline */}
        <Card className={isDark ? "bg-slate-900 border-white/10" : "bg-white border-2 border-slate-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              Vehicle Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-4 ${isDark ? "divide-slate-700" : "divide-slate-200"} divide-y`}>
              <div className="pt-4 first:pt-0">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Vehicle Created
                    </p>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {formatDate(vehicle.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Last Seen
                    </p>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {formatDate(vehicle.lastSeenAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error History */}
        {errors.length > 0 && (
          <Card className={isDark ? "bg-slate-900 border-white/10" : "bg-white"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Error History
              </CardTitle>
              <CardDescription>All detected errors and their resolution status</CardDescription>
            </CardHeader>
            <CardContent>
              {errorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>Loading errors...</p>
                </div>
              ) : errors.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No errors recorded for this vehicle</p>
                </div>
              ) : (
                <div className={`space-y-3 max-h-96 overflow-y-auto ${isDark ? "divide-slate-700" : "divide-slate-200"} divide-y`}>
                  {errors.map((err) => (
                    <div key={err.id} className={`border-l-4 rounded-sm p-4 ${isDark ? "bg-slate-800" : "bg-slate-50"} ${getSeverityColor(err.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                              {err.title}
                            </p>
                            <Badge className={`text-xs ${getStatusColor(err.status)}`}>
                              {err.status}
                            </Badge>
                            <Badge className={`text-xs ${
                              err.severity === "CRITICAL"
                                ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                                : err.severity === "MODERATE"
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                  : "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
                            }`}>
                              {err.severity}
                            </Badge>
                          </div>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {err.errorCode} • {err.subsystem}
                          </p>
                        </div>
                      </div>

                      <p className={`text-sm mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {err.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className={isDark ? "text-slate-500" : "text-slate-500"}>Reported</p>
                          <p className={`font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {formatDate(err.reportedAt)}
                          </p>
                        </div>
                        {err.resolved && err.resolvedAt && (
                          <div>
                            <p className={isDark ? "text-slate-500" : "text-slate-500"}>Resolved</p>
                            <p className={`font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {formatDate(err.resolvedAt)}
                            </p>
                          </div>
                        )}
                        {err.serviceJobNumber && (
                          <div className="col-span-2">
                            <p className={isDark ? "text-slate-500" : "text-slate-500"}>Service Job</p>
                            <p className={`font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {err.serviceJobNumber} ({err.serviceJobStatus})
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DriverDashboard
