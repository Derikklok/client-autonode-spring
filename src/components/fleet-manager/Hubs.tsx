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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  AddIcon,
  MapPinIcon,
  Package01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons"

interface Hub {
  id: string
  name: string
  location: string
  capacity: number
  currentLoad: number
  activeVehicles: number
  totalVehicles: number
  operationalStatus: "operational" | "maintenance" | "full"
  manager: string
  contact: string
}

const mockHubs: Hub[] = [
  {
    id: "1",
    name: "Houston Hub",
    location: "Houston, TX",
    capacity: 150,
    currentLoad: 127,
    activeVehicles: 42,
    totalVehicles: 56,
    operationalStatus: "operational",
    manager: "David Martinez",
    contact: "+1 (713) 555-0142",
  },
  {
    id: "2",
    name: "Dallas Hub",
    location: "Dallas, TX",
    capacity: 120,
    currentLoad: 118,
    activeVehicles: 38,
    totalVehicles: 48,
    operationalStatus: "operational",
    manager: "Sarah Johnson",
    contact: "+1 (214) 555-0167",
  },
  {
    id: "3",
    name: "Austin Hub",
    location: "Austin, TX",
    capacity: 100,
    currentLoad: 95,
    activeVehicles: 28,
    totalVehicles: 35,
    operationalStatus: "operational",
    manager: "Robert Chen",
    contact: "+1 (512) 555-0198",
  },
  {
    id: "4",
    name: "San Antonio Hub",
    location: "San Antonio, TX",
    capacity: 80,
    currentLoad: 80,
    activeVehicles: 24,
    totalVehicles: 30,
    operationalStatus: "full",
    manager: "Emma Rodriguez",
    contact: "+1 (210) 555-0145",
  },
  {
    id: "5",
    name: "Fort Worth Hub",
    location: "Fort Worth, TX",
    capacity: 90,
    currentLoad: 45,
    activeVehicles: 12,
    totalVehicles: 20,
    operationalStatus: "operational",
    manager: "Michael Thompson",
    contact: "+1 (817) 555-0198",
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "operational":
      return {
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        label: "Operational",
      }
    case "maintenance":
      return {
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
        label: "Maintenance",
      }
    case "full":
      return {
        color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
        label: "Capacity Full",
      }
    default:
      return {
        color: "bg-slate-500/10 text-slate-700",
        label: "Unknown",
      }
  }
}

export function FleetManagerHubs({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [hubs] = useState<Hub[]>(mockHubs)

  const filteredHubs = hubs.filter((hub) => {
    return (
      hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.manager.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalCapacity = hubs.reduce((sum, h) => sum + h.capacity, 0)
  const totalLoad = hubs.reduce((sum, h) => sum + h.currentLoad, 0)
  const utilizationRate = ((totalLoad / totalCapacity) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Hubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hubs.length}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Across the region
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationRate}%</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Average capacity usage
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hubs.reduce((sum, h) => sum + h.totalVehicles, 0)}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Stored across hubs
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hubs.reduce((sum, h) => sum + h.activeVehicles, 0)}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Vehicles on route
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hubs List */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Distribution Hubs</CardTitle>
              <CardDescription>
                Manage {filteredHubs.length} distribution hubs
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <HugeiconsIcon icon={AddIcon} className="h-4 w-4" />
              Add Hub
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className={`relative ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg`}>
            <HugeiconsIcon
              icon={Search01Icon}
              className={`absolute left-3 top-3 h-5 w-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            />
            <Input
              placeholder="Search by hub name, location, or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`border-0 pl-10 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100"}`}
            />
          </div>

          {/* Hubs Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredHubs.map((hub) => {
              const statusConfig = getStatusConfig(hub.operationalStatus)
              const utilizationPercent = (hub.currentLoad / hub.capacity) * 100

              return (
                <div
                  key={hub.id}
                  className={`rounded-lg border p-6 ${isDark ? "border-white/10 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{hub.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <HugeiconsIcon icon={MapPinIcon} className="h-4 w-4 text-slate-400" />
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {hub.location}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Manager Info */}
                    <div className={`rounded p-3 ${isDark ? "bg-slate-700/50" : "bg-white"}`}>
                      <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Hub Manager
                      </p>
                      <p className="font-medium">{hub.manager}</p>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {hub.contact}
                      </p>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          Capacity
                        </p>
                        <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {hub.currentLoad} / {hub.capacity}
                        </p>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                        <div
                          className={`h-full transition-all ${
                            utilizationPercent > 90
                              ? "bg-red-500"
                              : utilizationPercent > 70
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`rounded p-3 ${isDark ? "bg-slate-700/50" : "bg-white"}`}>
                        <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Active Vehicles
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <HugeiconsIcon icon={TruckIcon} className="h-4 w-4 text-blue-500" />
                          <p className="font-semibold">{hub.activeVehicles}</p>
                        </div>
                      </div>
                      <div className={`rounded p-3 ${isDark ? "bg-slate-700/50" : "bg-white"}`}>
                        <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          Total Stored
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <HugeiconsIcon icon={Package01Icon} className="h-4 w-4 text-slate-500" />
                          <p className="font-semibold">{hub.totalVehicles}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredHubs.length === 0 && (
            <div className="py-12 text-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                No hubs found matching your search
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
