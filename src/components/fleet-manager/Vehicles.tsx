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
  AlertCircleIcon,
  CheckCircle,
  Clock03Icon,
} from "@hugeicons/core-free-icons"

interface Vehicle {
  id: string
  licensePlate: string
  model: string
  status: "active" | "maintenance" | "idle"
  mileage: number
  driver: string
  location: string
  fuelLevel: number
  lastMaintenance: string
}

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    licensePlate: "TX-4521",
    model: "Volvo FH16",
    status: "active",
    mileage: 124567,
    driver: "John Anderson",
    location: "Houston Hub",
    fuelLevel: 85,
    lastMaintenance: "2025-12-15",
  },
  {
    id: "2",
    licensePlate: "TX-4522",
    model: "Scania R440",
    status: "maintenance",
    mileage: 98234,
    driver: "-",
    location: "Service Center",
    fuelLevel: 0,
    lastMaintenance: "2024-01-04",
  },
  {
    id: "3",
    licensePlate: "TX-4523",
    model: "MAN TGX",
    status: "active",
    mileage: 156789,
    driver: "Maria Lopez",
    location: "Dallas Hub",
    fuelLevel: 62,
    lastMaintenance: "2025-11-20",
  },
  {
    id: "4",
    licensePlate: "TX-4524",
    model: "Volvo FH16",
    status: "idle",
    mileage: 87654,
    driver: "-",
    location: "Houston Hub",
    fuelLevel: 45,
    lastMaintenance: "2025-10-10",
  },
  {
    id: "5",
    licensePlate: "TX-4525",
    model: "DAF XF",
    status: "active",
    mileage: 234567,
    driver: "James Wilson",
    location: "Austin Hub",
    fuelLevel: 78,
    lastMaintenance: "2025-12-01",
  },
]

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
        icon: AlertCircleIcon,
        label: "Maintenance",
      }
    case "idle":
      return {
        color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
        icon: Clock03Icon,
        label: "Idle",
      }
    default:
      return {
        color: "bg-slate-500/10 text-slate-700",
        icon: Clock03Icon,
        label: "Unknown",
      }
  }
}

export function FleetManagerVehicles({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [vehicles] = useState<Vehicle[]>(mockVehicles)

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
  const totalMileage = vehicles.reduce((sum, v) => sum + v.mileage, 0)

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
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>
                Manage and monitor {filteredVehicles.length} vehicles
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <HugeiconsIcon icon={AddIcon} className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className={`relative flex-1 ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg`}>
              <HugeiconsIcon
                icon={Search01Icon}
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
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicles Table */}
          <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <Table>
              <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Mileage</TableHead>
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
                      <TableCell>{vehicle.model}</TableCell>
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
                      <TableCell>{vehicle.driver || "-"}</TableCell>
                      <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {vehicle.location}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-16 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                            <div
                              className={`h-full rounded-full ${
                                vehicle.fuelLevel > 50
                                  ? "bg-emerald-500"
                                  : vehicle.fuelLevel > 25
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{vehicle.fuelLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                      <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {vehicle.lastMaintenance}
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

          {filteredVehicles.length === 0 && (
            <div className="py-12 text-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                No vehicles found matching your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
