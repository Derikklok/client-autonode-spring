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
import { Phone, Mail } from "lucide-react"
import {
  Search01Icon,
  AddIcon,
  CheckCircle,
  AlertCircleIcon,
  Clock03Icon,
} from "@hugeicons/core-free-icons"

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  role: "driver" | "mechanic" | "manager"
  status: "active" | "inactive" | "on-leave"
  licenseNumber: string
  hireDate: string
  assignedVehicles: number
  totalDeliveries: number
  rating: number
}

const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "John Anderson",
    email: "john.anderson@autonodefl.com",
    phone: "+1 (713) 555-0142",
    role: "driver",
    status: "active",
    licenseNumber: "TX-DL-2024-001",
    hireDate: "2020-05-15",
    assignedVehicles: 1,
    totalDeliveries: 847,
    rating: 4.8,
  },
  {
    id: "2",
    name: "Maria Lopez",
    email: "maria.lopez@autonodefl.com",
    phone: "+1 (214) 555-0167",
    role: "driver",
    status: "active",
    licenseNumber: "TX-DL-2024-002",
    hireDate: "2021-03-22",
    assignedVehicles: 1,
    totalDeliveries: 642,
    rating: 4.9,
  },
  {
    id: "3",
    name: "James Wilson",
    email: "james.wilson@autonodefl.com",
    phone: "+1 (512) 555-0198",
    role: "driver",
    status: "active",
    licenseNumber: "TX-DL-2024-003",
    hireDate: "2019-07-10",
    assignedVehicles: 1,
    totalDeliveries: 1205,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Robert Chen",
    email: "robert.chen@autonodefl.com",
    phone: "+1 (817) 555-0145",
    role: "mechanic",
    status: "active",
    licenseNumber: "TX-MC-2024-001",
    hireDate: "2018-01-05",
    assignedVehicles: 0,
    totalDeliveries: 0,
    rating: 4.6,
  },
  {
    id: "5",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@autonodefl.com",
    phone: "+1 (210) 555-0198",
    role: "manager",
    status: "active",
    licenseNumber: "TX-DL-2024-004",
    hireDate: "2017-09-18",
    assignedVehicles: 0,
    totalDeliveries: 0,
    rating: 4.9,
  },
  {
    id: "6",
    name: "Michael Thompson",
    email: "michael.thompson@autonodefl.com",
    phone: "+1 (832) 555-0167",
    role: "driver",
    status: "on-leave",
    licenseNumber: "TX-DL-2024-005",
    hireDate: "2022-06-30",
    assignedVehicles: 0,
    totalDeliveries: 312,
    rating: 4.5,
  },
]

const getRoleConfig = (role: string) => {
  switch (role) {
    case "driver":
      return { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400", label: "Driver" }
    case "mechanic":
      return { color: "bg-purple-500/10 text-purple-700 dark:text-purple-400", label: "Mechanic" }
    case "manager":
      return { color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", label: "Manager" }
    default:
      return { color: "bg-slate-500/10 text-slate-700", label: "Unknown" }
  }
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return {
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
        icon: CheckCircle,
        label: "Active",
      }
    case "inactive":
      return {
        color: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30",
        icon: AlertCircleIcon,
        label: "Inactive",
      }
    case "on-leave":
      return {
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
        icon: Clock03Icon,
        label: "On Leave",
      }
    default:
      return {
        color: "bg-slate-500/10 text-slate-700",
        icon: AlertCircleIcon,
        label: "Unknown",
      }
  }
}

export function FleetManagerUsers({ isDark }: { isDark: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [drivers] = useState<Driver[]>(mockDrivers)

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || driver.role === roleFilter
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const activeDrivers = drivers.filter((d) => d.status === "active" && d.role === "driver").length
  const totalStaff = drivers.length

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Employees registered
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers}</div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Currently on duty
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mechanics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.filter((d) => d.role === "mechanic").length}
            </div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Service team members
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
            </div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Staff performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fleet Staff</CardTitle>
              <CardDescription>
                Manage {filteredDrivers.length} team members
              </CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <HugeiconsIcon icon={AddIcon} className="h-4 w-4" />
              Add Staff
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
                placeholder="Search by name, email, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border-0 pl-10 ${isDark ? "bg-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-100"}`}
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className={`w-full sm:w-40 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="mechanic">Mechanic</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={`w-full sm:w-40 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}`}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <Table>
              <TableHeader className={isDark ? "bg-slate-800/50" : "bg-slate-50"}>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const roleConfig = getRoleConfig(driver.role)
                  const statusConfig = getStatusConfig(driver.status)
                  return (
                    <TableRow
                      key={driver.id}
                      className={isDark ? "border-white/5 hover:bg-slate-800/50" : "border-slate-200 hover:bg-slate-50"}
                    >
                      <TableCell className="font-semibold">{driver.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleConfig.color}>
                          {getRoleConfig(driver.role).label}
                        </Badge>
                      </TableCell>
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
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{driver.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-400">{driver.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {driver.licenseNumber}
                      </TableCell>
                      <TableCell className={isDark ? "text-slate-400" : "text-slate-600"}>
                        {new Date(driver.hireDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{driver.assignedVehicles}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{driver.rating}</span>
                          <span className="text-amber-400">★</span>
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

          {filteredDrivers.length === 0 && (
            <div className="py-12 text-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                No staff found matching your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
