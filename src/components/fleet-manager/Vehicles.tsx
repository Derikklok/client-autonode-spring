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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Grid3X3,
  List,
  Calendar,
  Gauge,
  Truck,
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"
import { FleetManagerService } from "@/components/api/fleetManager.service"
import type { Vehicle as ApiVehicle } from "@/types/vehicle.types"
import { VehicleEditForm } from "./VehicleEditForm"
import { VehicleImageUploadModal } from "./VehicleImageUploadModal"
import { VehicleCreateForm } from "./VehicleCreateForm"

// Transform API vehicle to local format
const transformVehicle = (apiVehicle: ApiVehicle): Vehicle => {
  const statusMap: Record<string, "active" | "maintenance" | "idle"> = {
    ACTIVE: "active",
    IN_SERVICE: "maintenance",
    INACTIVE: "idle",
  }
  
  return {
    id: apiVehicle.id,
    licensePlate: apiVehicle.plateNumber,
    manufacturer: apiVehicle.manufacturer,
    model: apiVehicle.model,
    fullModel: `${apiVehicle.manufacturer} ${apiVehicle.model}`,
    year: apiVehicle.year,
    status: statusMap[apiVehicle.status] || "idle",
    currentMileage: apiVehicle.currentMileage,
    serviceMileage: apiVehicle.serviceMileage,
    driver: apiVehicle.driverName || "-",
    location: apiVehicle.departmentName,
    imageUrl: apiVehicle.imageUrl,
    lastMaintenance: new Date(apiVehicle.createdAt).toISOString().split('T')[0],
  }
}

interface Vehicle {
  id: string
  licensePlate: string
  manufacturer: string
  model: string
  fullModel: string
  year: number
  status: "active" | "maintenance" | "idle"
  currentMileage: number
  serviceMileage: number
  driver: string
  location: string
  imageUrl?: string
  lastMaintenance: string
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        icon: CheckCircle,
        label: "Active",
      }
    case "maintenance":
      return {
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
        icon: AlertCircle,
        label: "In Service",
      }
    case "idle":
      return {
        color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
        icon: Clock,
        label: "Inactive",
      }
    default:
      return {
        color: "bg-slate-500/10 text-slate-700",
        icon: Clock,
        label: "Unknown",
      }
  }
}

export function FleetManagerVehicles({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "gallery">("table")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState<ApiVehicle | null>(null)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [imageUploadOpen, setImageUploadOpen] = useState(false)
  const [selectedVehicleForImageUpload, setSelectedVehicleForImageUpload] = useState<ApiVehicle | null>(null)
  const [createFormOpen, setCreateFormOpen] = useState(false)

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const apiVehicles = await FleetManagerService.getVehicles()
        const transformedVehicles = apiVehicles.map(transformVehicle)
        setVehicles(transformedVehicles)
        setError(null)
      } catch (err) {
        setError("Failed to load vehicles. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Handle viewing vehicle details
  const handleViewVehicle = async (vehicleId: string) => {
    try {
      setDetailsLoading(true)
      setDetailsError(null)
      const details = await FleetManagerService.getVehicleById(vehicleId)
      setVehicleDetails(details)
      setDetailsOpen(true)
    } catch (err) {
      setDetailsError("Failed to load vehicle details. Please try again.")
      console.error(err)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setVehicleDetails(null)
    setDetailsError(null)
    setIsEditMode(false)
  }

  const handleEditSave = (updatedVehicle: ApiVehicle) => {
    // Update the vehicles list with the updated vehicle
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) => (v.id === updatedVehicle.id ? transformVehicle(updatedVehicle) : v))
    )
    // Update the details view with new data
    setVehicleDetails(updatedVehicle)
    // Exit edit mode after a short delay
    setTimeout(() => {
      setIsEditMode(false)
    }, 1500)
  }

  const handleImageUploadSuccess = (updatedVehicle: ApiVehicle) => {
    // Update the vehicles list with the updated vehicle
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) => (v.id === updatedVehicle.id ? transformVehicle(updatedVehicle) : v))
    )
    // Update the details view with new data
    setVehicleDetails(updatedVehicle)
    setSelectedVehicleForImageUpload(updatedVehicle)
  }

  const handleOpenImageUploadModal = (vehicle: ApiVehicle) => {
    setSelectedVehicleForImageUpload(vehicle)
    setImageUploadOpen(true)
  }

  const handleOpenImageUploadForGallery = async (vehicleId: string) => {
    try {
      const apiVehicle = await FleetManagerService.getVehicleById(vehicleId)
      handleOpenImageUploadModal(apiVehicle)
    } catch {
      console.error("Failed to fetch vehicle details for image upload")
    }
  }

  const handleCreateVehicleSuccess = (newVehicle: ApiVehicle) => {
    // Add the new vehicle to the vehicles list
    const transformedVehicle = transformVehicle(newVehicle)
    setVehicles((prevVehicles) => [transformedVehicle, ...prevVehicles])
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeVehicles = vehicles.filter((v) => v.status === "active").length
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length
  const totalMileage = vehicles.reduce((sum, v) => sum + v.currentMileage, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
              <CardHeader className="pb-3">
                <div className={`h-4 w-24 rounded ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
              </CardHeader>
              <CardContent>
                <div className={`h-8 w-12 rounded ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={`${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"} border-red-500/50`}>
        <CardContent className="pt-6">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVehicles}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Out on the road
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{maintenanceVehicles}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Awaiting service
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Vehicles registered
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fleet Mileage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalMileage / 1000).toFixed(0)}K</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total miles driven
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>
                Manage and monitor {filteredVehicles.length} vehicles
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "gallery" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("gallery")}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                size="sm" 
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setCreateFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className={`relative flex-1 ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg`}>
              <Search
                className={`absolute left-3 top-3 h-5 w-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              />
              <Input
                placeholder="Search by plate, model, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border-0 pl-10 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100"}`}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={`w-full sm:w-48 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">In Service</SelectItem>
                <SelectItem value="idle">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <Table>
                <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Mileage</TableHead>
                    <TableHead>Service Mileage</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Service</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => {
                    const statusConfig = getStatusConfig(vehicle.status)
                    return (
                      <TableRow
                        key={vehicle.id}
                        className={isDark ? "border-white/5 hover:bg-slate-800/50" : "border-slate-200 hover:bg-slate-50"}
                      >
                        <TableCell className="font-semibold">{vehicle.licensePlate}</TableCell>
                        <TableCell>{vehicle.manufacturer}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1 ${statusConfig.color}`}
                          >
                            {statusConfig.icon && (
                              <statusConfig.icon className="h-3 w-3" />
                            )}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{vehicle.currentMileage.toLocaleString()} km</TableCell>
                        <TableCell>{vehicle.serviceMileage.toLocaleString()} km</TableCell>
                        <TableCell>{vehicle.driver || "-"}</TableCell>
                        <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                          {vehicle.location}
                        </TableCell>
                        <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                          {vehicle.lastMaintenance}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewVehicle(vehicle.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Gallery View */}
          {viewMode === "gallery" && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((vehicle) => {
                const statusConfig = getStatusConfig(vehicle.status)
                return (
                  <div
                    key={vehicle.id}
                    className={`group overflow-hidden rounded-xl border transition-all hover:shadow-lg ${
                      isDark
                        ? "border-white/10 bg-linear-to-br from-slate-800 to-slate-900 hover:border-blue-500/50 hover:shadow-blue-500/20"
                        : "border-slate-200 bg-linear-to-br from-white to-slate-50 hover:border-blue-400 hover:shadow-blue-300/20"
                    }`}
                  >
                    {/* Image Container */}
                    <div className={`relative overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-100"} h-56`}>
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.model}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Truck className={`h-20 w-20 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                        </div>
                      )}
                      
                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 right-3">
                        <Badge className={`${statusConfig.color} gap-1`}>
                          {statusConfig.icon && (
                            <statusConfig.icon className="h-3 w-3" />
                          )}
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-5 space-y-4 ${isDark ? "border-t border-white/10" : "border-t border-slate-200"}`}>
                      {/* Header */}
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {vehicle.licensePlate}
                        </h3>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {vehicle.fullModel} ({vehicle.year})
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-3">
                        {/* Driver */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Driver
                          </span>
                          <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {vehicle.driver || "-"}
                          </span>
                        </div>

                        {/* Mileage */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gauge className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                            <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Current
                            </span>
                          </div>
                          <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {vehicle.currentMileage.toLocaleString()} km
                          </span>
                        </div>

                        {/* Service Mileage */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gauge className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                            <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Service
                            </span>
                          </div>
                          <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {vehicle.serviceMileage.toLocaleString()} km
                          </span>
                        </div>

                        {/* Last Service */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                            <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Last Service
                            </span>
                          </div>
                          <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {vehicle.lastMaintenance}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Location
                          </span>
                          <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            {vehicle.location}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={() => handleOpenImageUploadForGallery(vehicle.id)}
                        className="w-full mt-2 gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                      >
                        Update Vehicle Image
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredVehicles.length === 0 && (
            <div className="py-12 text-center">
              <Truck className={`mx-auto h-12 w-12 mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                No vehicles found matching your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? "border-amber-500/30 bg-slate-900" : "border-amber-200 bg-white"}`}>
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className={`text-2xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                  {vehicleDetails?.plateNumber || "Vehicle Details"}
                </DialogTitle>
                <DialogDescription className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Complete vehicle information and specifications
                </DialogDescription>
              </div>
              {!isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetails}
                  className={isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-600 hover:bg-slate-100"}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {isEditMode && vehicleDetails ? (
            // Edit Mode
            <div className={`${isDark ? "border-t border-slate-800" : "border-t border-slate-200"} pt-6`}>
              <VehicleEditForm
                vehicle={vehicleDetails}
                isDark={isDark}
                onSave={(updatedVehicle) => {
                  handleEditSave(updatedVehicle)
                }}
                onCancel={() => setIsEditMode(false)}
              />
            </div>
          ) : (
            // View Mode
            <>
              {detailsLoading ? (
            <div className="py-12 text-center">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <div className={`h-8 w-8 rounded-full border-3 border-transparent ${isDark ? "border-t-amber-400" : "border-t-amber-600"} animate-spin`} />
              </div>
              <p className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Loading vehicle details...</p>
            </div>
          ) : detailsError ? (
            <div className={`p-4 rounded-lg ${isDark ? "bg-red-500/15 border border-red-500/40" : "bg-red-50 border border-red-200"}`}>
              <p className={`text-sm font-medium ${isDark ? "text-red-400" : "text-red-700"}`}>{detailsError}</p>
            </div>
          ) : vehicleDetails ? (
            <div className={`space-y-6 ${isDark ? "border-t border-slate-800" : "border-t border-slate-200"} pt-6`}>
              {/* Vehicle Image with Status Badge */}
              {vehicleDetails.imageUrl && (
                <div className="relative rounded-xl overflow-hidden h-72 shadow-lg">
                  <img
                    src={vehicleDetails.imageUrl}
                    alt={vehicleDetails.model}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    {(() => {
                      const statusMap: Record<string, "active" | "maintenance" | "idle"> = {
                        ACTIVE: "active",
                        IN_SERVICE: "maintenance",
                        INACTIVE: "idle",
                      }
                      const mappedStatus = statusMap[vehicleDetails.status] || "idle"
                      const config = getStatusConfig(mappedStatus)
                      return (
                        <Badge className={`gap-2 px-3 py-1 ${config.color} shadow-md`}>
                          {config.icon && <config.icon className="h-4 w-4" />}
                          <span className="font-semibold">{config.label}</span>
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Basic Information Grid */}
              <div className={`grid gap-5 md:grid-cols-2 p-5 rounded-xl ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-amber-50/50 border border-amber-100"}`}>
                <div className="space-y-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    License Plate
                  </label>
                  <p className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {vehicleDetails.plateNumber}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    Manufacturer
                  </label>
                  <p className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {vehicleDetails.manufacturer}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    Model
                  </label>
                  <p className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {vehicleDetails.model}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    Year
                  </label>
                  <p className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {vehicleDetails.year}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    Department / Location
                  </label>
                  <p className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    📍 {vehicleDetails.departmentName}
                  </p>
                </div>
              </div>

              {/* Mileage Information */}
              <div className={`grid gap-4 md:grid-cols-2 p-5 rounded-xl ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-blue-50/50 border border-blue-100"}`}>
                <div className="space-y-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    Current Mileage
                  </label>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-700/50" : "bg-white"}`}>
                    <Gauge className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                    <p className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {vehicleDetails.currentMileage.toLocaleString()}
                    </p>
                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>km</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                    Service Mileage
                  </label>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-slate-700/50" : "bg-white"}`}>
                    <Gauge className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                    <p className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {vehicleDetails.serviceMileage.toLocaleString()}
                    </p>
                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>km</span>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              {(vehicleDetails.driverName || vehicleDetails.driverId) && (
                <div className={`p-5 rounded-xl ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-purple-50/50 border border-purple-100"}`}>
                  <h3 className={`font-semibold mb-4 text-xs uppercase tracking-wide ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                    👤 Driver Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Driver Name</p>
                      <p className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {vehicleDetails.driverName || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Driver ID</p>
                      <p className={`text-lg font-semibold font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {vehicleDetails.driverId || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className={`p-5 rounded-xl ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
                <h3 className={`font-semibold mb-4 text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                  ℹ️ Additional Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Vehicle ID</p>
                    <p className={`text-sm font-mono mt-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {vehicleDetails.id}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Created Date</p>
                    <p className={`text-sm font-semibold mt-1 flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      <Calendar className="h-4 w-4" />
                      {new Date(vehicleDetails.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Edit Vehicle
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseDetails}
                  className={`flex-1 ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"} font-semibold`}
                >
                  Close
                </Button>
              </div>
            </div>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Vehicle Image Upload Modal */}
      {selectedVehicleForImageUpload && (
        <VehicleImageUploadModal
          vehicle={selectedVehicleForImageUpload}
          isDark={isDark}
          isOpen={imageUploadOpen}
          onClose={() => {
            setImageUploadOpen(false)
            setSelectedVehicleForImageUpload(null)
          }}
          onSuccess={handleImageUploadSuccess}
        />
      )}

      {/* Vehicle Create Form Dialog */}
      <VehicleCreateForm
        isDark={isDark}
        isOpen={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onSuccess={handleCreateVehicleSuccess}
      />
    </div>
  )
}
