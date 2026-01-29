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
  Database,
  Eye,
  Zap,
  Search,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Gauge,
  Trash2,
} from "lucide-react"
import { FleetManagerHubService } from "@/components/api/fleetManager.service"
import { HubAssignmentDialog } from "./HubAssignmentDialog"
import { HubRemovalDialog } from "./HubRemovalDialog"
import { HubCreationDialog } from "./HubCreationDialog"
import type { Vehicle } from "@/types/vehicle.types"

interface LocalHub {
  id: string
  serialNumber: string
  manufacturer: string
  modelName: string
  supplierName: string
  vehiclePlateNumber: string | null
  departmentName: string
  createdAt: string
}

export function FleetManagerHubs({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [hubs, setHubs] = useState<LocalHub[]>([])
  const [vehiclesWithoutHubs, setVehiclesWithoutHubs] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [hubAssignmentOpen, setHubAssignmentOpen] = useState(false)
  const [selectedVehicleForHub, setSelectedVehicleForHub] = useState<Vehicle | null>(null)
  const [hubRemovalOpen, setHubRemovalOpen] = useState(false)
  const [selectedHubForRemoval, setSelectedHubForRemoval] = useState<LocalHub | null>(null)
  const [hubCreationOpen, setHubCreationOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiHubs = await FleetManagerHubService.getHubs()
        setHubs(apiHubs as LocalHub[])

        // Extract unique departments
        const uniqueDepts = Array.from(new Set(apiHubs.map(h => h.departmentName)))
        setDepartments(uniqueDepts as string[])

        setError(null)
      } catch (err) {
        setError("Failed to load hubs. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchVehiclesWithoutHubs = async () => {
      try {
        const vehicles = await FleetManagerHubService.getVehiclesWithoutHubs()
        setVehiclesWithoutHubs(vehicles)
      } catch (err) {
        console.error("Failed to load vehicles needing hubs.", err)
      }
    }

    fetchVehiclesWithoutHubs()
  }, [])

  const filteredHubs = hubs.filter((hub) => {
    const matchesSearch =
      hub.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.supplierName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || hub.departmentName === departmentFilter

    return matchesSearch && matchesDepartment
  })

  const assignedHubs = hubs.filter((h) => h.vehiclePlateNumber !== null).length
  const unassignedHubs = hubs.length - assignedHubs
  const totalHubs = hubs.length

  const handleAssignHub = (vehicle: Vehicle) => {
    setSelectedVehicleForHub(vehicle)
    setHubAssignmentOpen(true)
  }

  const handleAssignmentSuccess = () => {
    // Refresh vehicles without hubs list
    const fetchVehicles = async () => {
      try {
        const vehicles = await FleetManagerHubService.getVehiclesWithoutHubs()
        setVehiclesWithoutHubs(vehicles)
        
        // Also refresh hubs list
        const apiHubs = await FleetManagerHubService.getHubs()
        setHubs(apiHubs as LocalHub[])
      } catch (err) {
        console.error("Failed to refresh data:", err)
      }
    }
    fetchVehicles()
  }

  const handleRemoveHub = (hub: LocalHub) => {
    setSelectedHubForRemoval(hub)
    setHubRemovalOpen(true)
  }

  const handleRemovalSuccess = () => {
    // Refresh both lists
    const fetchData = async () => {
      try {
        const vehicles = await FleetManagerHubService.getVehiclesWithoutHubs()
        setVehiclesWithoutHubs(vehicles)
        
        const apiHubs = await FleetManagerHubService.getHubs()
        setHubs(apiHubs as LocalHub[])
      } catch (err) {
        console.error("Failed to refresh data:", err)
      }
    }
    fetchData()
  }

  const handleCreationSuccess = () => {
    // Refresh hubs list
    const fetchHubs = async () => {
      try {
        const apiHubs = await FleetManagerHubService.getHubs()
        setHubs(apiHubs as LocalHub[])
        
        // Extract unique departments
        const uniqueDepts = Array.from(new Set(apiHubs.map(h => h.departmentName)))
        setDepartments(uniqueDepts as string[])
      } catch (err) {
        console.error("Failed to refresh hubs:", err)
      }
    }
    fetchHubs()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200"}>
              <CardContent className="pt-6">
                <div className={`h-8 w-20 rounded ${isDark ? "bg-slate-800" : "bg-slate-200"} animate-pulse`} />
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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {/* Total Hubs Card */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 ${
          isDark 
            ? "border-blue-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-blue-950/30" 
            : "border-blue-200/50 bg-linear-to-br from-white via-blue-50/30 to-blue-100/20"
        }`}>
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${isDark ? "bg-blue-500" : "bg-blue-400"}`} />
          
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Total Hubs
              </CardTitle>
              <div className={`rounded-lg p-2 ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                <Database className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {totalHubs}
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-blue-400/80" : "text-blue-700/80"}`}>
              OBD devices configured
            </p>
          </CardContent>
        </Card>

        {/* Assigned Hubs Card */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 ${
          isDark 
            ? "border-emerald-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/30" 
            : "border-emerald-200/50 bg-linear-to-br from-white via-emerald-50/30 to-emerald-100/20"
        }`}>
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${isDark ? "bg-emerald-500" : "bg-emerald-400"}`} />
          
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Assigned
              </CardTitle>
              <div className={`rounded-lg p-2 ${isDark ? "bg-emerald-500/20" : "bg-emerald-100"}`}>
                <CheckCircle className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {assignedHubs}
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-emerald-400/80" : "text-emerald-700/80"}`}>
              Installed in vehicles
            </p>
          </CardContent>
        </Card>

        {/* Unassigned Hubs Card */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 ${
          isDark 
            ? "border-amber-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/30" 
            : "border-amber-200/50 bg-linear-to-br from-white via-amber-50/30 to-amber-100/20"
        }`}>
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${isDark ? "bg-amber-500" : "bg-amber-400"}`} />
          
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Available
              </CardTitle>
              <div className={`rounded-lg p-2 ${isDark ? "bg-amber-500/20" : "bg-amber-100"}`}>
                <Clock className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {unassignedHubs}
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-amber-400/80" : "text-amber-700/80"}`}>
              Ready to assign
            </p>
          </CardContent>
        </Card>

        {/* Coverage Card */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 ${
          isDark 
            ? "border-purple-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-purple-950/30" 
            : "border-purple-200/50 bg-linear-to-br from-white via-purple-50/30 to-purple-100/20"
        }`}>
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${isDark ? "bg-purple-500" : "bg-purple-400"}`} />
          
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Coverage
              </CardTitle>
              <div className={`rounded-lg p-2 ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                <Zap className={`h-4 w-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {totalHubs > 0 ? Math.round((assignedHubs / totalHubs) * 100) : 0}%
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-purple-400/80" : "text-purple-700/80"}`}>
              Fleet coverage
            </p>
          </CardContent>
        </Card>

        {/* Vehicles Needing Hubs Card */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 ${
          isDark 
            ? "border-red-500/20 bg-linear-to-br from-slate-900 via-slate-900 to-red-950/30" 
            : "border-red-200/50 bg-linear-to-br from-white via-red-50/30 to-red-100/20"
        }`}>
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl ${isDark ? "bg-red-500" : "bg-red-400"}`} />
          
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Vehicles
              </CardTitle>
              <div className={`rounded-lg p-2 ${isDark ? "bg-red-500/20" : "bg-red-100"}`}>
                <Gauge className={`h-4 w-4 ${isDark ? "text-red-400" : "text-red-600"}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {vehiclesWithoutHubs.length}
            </div>
            <p className={`text-xs font-medium ${isDark ? "text-red-400/80" : "text-red-700/80"}`}>
              Needing hubs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Needing Hubs Section */}
      {vehiclesWithoutHubs.length > 0 && (
        <Card className={`border-l-4 ${isDark ? "border-l-red-500 border-white/10 bg-slate-900" : "border-l-red-500 border-slate-200 bg-white"}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-red-500" />
                  Vehicles Needing Hubs
                </CardTitle>
                <CardDescription>
                  {vehiclesWithoutHubs.length} vehicle(s) without OBD diagnostic hubs assigned
                </CardDescription>
              </div>
              <Badge className={`gap-2 ${isDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"}`} variant="outline">
                <AlertCircle className="h-3 w-3" />
                Action Needed
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <Table>
                <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Current Mileage</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehiclesWithoutHubs.map((vehicle) => (
                    <TableRow
                      key={vehicle.id}
                      className={isDark ? "border-white/5 hover:bg-slate-800/50" : "border-slate-200 hover:bg-slate-50"}
                    >
                      <TableCell className="font-semibold">{vehicle.plateNumber}</TableCell>
                      <TableCell>{vehicle.manufacturer}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell className="text-sm">{vehicle.year}</TableCell>
                      <TableCell className="text-sm">{vehicle.currentMileage} km</TableCell>
                      <TableCell>
                        {vehicle.driverEmail ? (
                          <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {vehicle.driverEmail}
                          </span>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isDark
                                ? "border-slate-500/40 bg-slate-500/10 text-slate-400"
                                : "border-slate-300 bg-slate-50 text-slate-600"
                            }`}
                          >
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAssignHub(vehicle)}
                                className={`gap-1 ${isDark ? "text-red-400 hover:text-red-300 hover:bg-red-500/20" : "text-red-600 hover:text-red-700 hover:bg-red-50"}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Assign Hub</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OBD Hubs</CardTitle>
              <CardDescription>
                Manage diagnostic hubs for {filteredHubs.length} vehicles
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setHubCreationOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Hub
            </Button>
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
                placeholder="Search by serial number, manufacturer, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border-0 pl-10 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100"}`}
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className={`w-full sm:w-48 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table View */}
          <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <Table>
              <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Assigned Vehicle</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        No hubs found matching your criteria
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHubs.map((hub) => (
                    <TableRow
                      key={hub.id}
                      className={isDark ? "border-white/5 hover:bg-slate-800/50" : "border-slate-200 hover:bg-slate-50"}
                    >
                      <TableCell className="font-semibold">{hub.serialNumber}</TableCell>
                      <TableCell>{hub.manufacturer}</TableCell>
                      <TableCell>{hub.modelName}</TableCell>
                      <TableCell className="text-sm">{hub.supplierName}</TableCell>
                      <TableCell>
                        {hub.vehiclePlateNumber ? (
                          <Badge
                            variant="outline"
                            className={`gap-1 ${
                              isDark
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-emerald-300 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            {hub.vehiclePlateNumber}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`gap-1 ${
                              isDark
                                ? "border-slate-500/40 bg-slate-500/10 text-slate-400"
                                : "border-slate-300 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {hub.departmentName}
                      </TableCell>
                      <TableCell className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {new Date(hub.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          {hub.vehiclePlateNumber ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveHub(hub)}
                                  className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove Hub</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                  disabled
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Not assigned</TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info Box */}
          <div
            className={`p-4 rounded-lg ${
              isDark
                ? "bg-blue-500/10 border border-blue-500/30"
                : "bg-blue-50/50 border border-blue-200"
            }`}
          >
            <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
              💡 <span className="font-medium">Tip:</span> OBD (On-Board Diagnostic) hubs are essential devices for vehicle diagnostics and monitoring. Assign them to vehicles to enable real-time performance tracking and anomaly detection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hub Assignment Dialog */}
      <HubAssignmentDialog
        open={hubAssignmentOpen}
        onOpenChange={setHubAssignmentOpen}
        vehicle={selectedVehicleForHub}
        onAssignSuccess={handleAssignmentSuccess}
      />

      {/* Hub Removal Dialog */}
      <HubRemovalDialog
        open={hubRemovalOpen}
        onOpenChange={setHubRemovalOpen}
        hub={selectedHubForRemoval ? { ...selectedHubForRemoval, supplierName: selectedHubForRemoval.supplierName || "", manufacturer: selectedHubForRemoval.manufacturer || "", modelName: selectedHubForRemoval.modelName || "" } : null}
        vehiclePlateNumber={selectedHubForRemoval?.vehiclePlateNumber}
        onRemoveSuccess={handleRemovalSuccess}
      />

      {/* Hub Creation Dialog */}
      <HubCreationDialog
        open={hubCreationOpen}
        onOpenChange={setHubCreationOpen}
        onCreateSuccess={handleCreationSuccess}
      />
    </div>
  )
}
