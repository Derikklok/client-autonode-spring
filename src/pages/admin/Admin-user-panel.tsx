import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Shield,
  Filter,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react"
import { AdminService } from "@/components/api/admin.service"
import { DepartmentService } from "@/components/api/department.service"
import type { AdminUser } from "@/types/admin.types"
import type { Department } from "@/types/department.types"

const getRoleColor = (role: string, isDark: boolean) => {
  const colors: Record<string, string> = {
    FLEET_MANAGER: isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border-emerald-300",
    MECHANIC: isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-700 border-amber-300",
    DRIVER: isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-300",
    ADMIN: isDark ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-purple-100 text-purple-700 border-purple-300",
  }
  return colors[role] || colors.DRIVER
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    FLEET_MANAGER: "Fleet Manager",
    MECHANIC: "Mechanic",
    DRIVER: "Driver",
    ADMIN: "Administrator",
  }
  return labels[role] || role
}

export function AdminUserPanel() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [departments, setDepartments] = useState<Department[]>([])
  const [assignedUsers, setAssignedUsers] = useState<AdminUser[]>([])
  const [unassignedFleetManagers, setUnassignedFleetManagers] = useState<AdminUser[]>([])
  const [unassignedMechanics, setUnassignedMechanics] = useState<AdminUser[]>([])
  const [unassignedDrivers, setUnassignedDrivers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<AdminUser | null>(null)
  const [selectedDepartmentForAssignment, setSelectedDepartmentForAssignment] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedUserForRemoval, setSelectedUserForRemoval] = useState<AdminUser | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const departmentsData = await DepartmentService.getAll()
      setDepartments(departmentsData)

      // Fetch all users for each department
      const allAssignedUsers: AdminUser[] = []
      for (const dept of departmentsData) {
        try {
          const deptUsers = await AdminService.getUsersByDepartmentId(dept.id)
          allAssignedUsers.push(...deptUsers)
        } catch (error) {
          console.error(`Failed to fetch users for department ${dept.id}:`, error)
        }
      }

      setAssignedUsers(allAssignedUsers)

      // Fetch fleet managers and filter for unassigned (null departmentName)
      const fleetManagersData = await AdminService.getFleetManagers()
      const unassignedFM = fleetManagersData.filter((fm) => fm.departmentName === null)
      setUnassignedFleetManagers(unassignedFM)

      // Fetch mechanics and filter for unassigned (null departmentName)
      const mechanicsData = await AdminService.getMechanics()
      const unassignedMech = mechanicsData.filter((m) => m.departmentName === null)
      setUnassignedMechanics(unassignedMech)

      // Fetch drivers and filter for unassigned (null departmentName)
      const driversData = await AdminService.getDrivers()
      const unassignedDrv = driversData.filter((d) => d.departmentName === null)
      setUnassignedDrivers(unassignedDrv)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch data"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAssignedUsers = assignedUsers.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesDepartment =
      departmentFilter === "all" || user.departmentName === departmentFilter

    return matchesSearch && matchesRole && matchesDepartment
  })

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await AdminService.deleteUser(userId)
      toast.success("User deleted successfully")
      // Refresh unassigned users
      const fleetManagersData = await AdminService.getFleetManagers()
      const unassignedFM = fleetManagersData.filter((fm) => fm.departmentName === null)
      setUnassignedFleetManagers(unassignedFM)

      const mechanicsData = await AdminService.getMechanics()
      const unassignedMech = mechanicsData.filter((m) => m.departmentName === null)
      setUnassignedMechanics(unassignedMech)

      const driversData = await AdminService.getDrivers()
      const unassignedDrv = driversData.filter((d) => d.departmentName === null)
      setUnassignedDrivers(unassignedDrv)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user"
      toast.error(message)
    }
  }

  const handleAssignUser = (user: AdminUser) => {
    setSelectedUserForAssignment(user)
    setSelectedDepartmentForAssignment("")
    setAssignDialogOpen(true)
  }

  const handleConfirmAssignment = async () => {
    if (!selectedUserForAssignment || !selectedDepartmentForAssignment) {
      toast.error("Please select a department")
      return
    }

    setIsAssigning(true)
    try {
      await AdminService.assignUserToDepartment(
        selectedUserForAssignment.id,
        Number(selectedDepartmentForAssignment)
      )
      toast.success("User assigned to department successfully")
      setAssignDialogOpen(false)
      setSelectedUserForAssignment(null)
      setSelectedDepartmentForAssignment("")
      
      // Refresh unassigned users
      const fleetManagersData = await AdminService.getFleetManagers()
      const unassignedFM = fleetManagersData.filter((fm) => fm.departmentName === null)
      setUnassignedFleetManagers(unassignedFM)

      const mechanicsData = await AdminService.getMechanics()
      const unassignedMech = mechanicsData.filter((m) => m.departmentName === null)
      setUnassignedMechanics(unassignedMech)

      const driversData = await AdminService.getDrivers()
      const unassignedDrv = driversData.filter((d) => d.departmentName === null)
      setUnassignedDrivers(unassignedDrv)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign user"
      toast.error(message)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveFromDepartment = (user: AdminUser) => {
    setSelectedUserForRemoval(user)
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemoval = async () => {
    if (!selectedUserForRemoval) return

    setIsRemoving(true)
    try {
      await AdminService.removeUserFromDepartment(selectedUserForRemoval.id)
      toast.success(`${selectedUserForRemoval.email} removed from department`)
      setRemoveDialogOpen(false)
      setSelectedUserForRemoval(null)

      // Refresh all data
      const departmentsData = await DepartmentService.getAll()
      setDepartments(departmentsData)

      // Fetch all assigned users
      const allAssignedUsers: AdminUser[] = []
      for (const dept of departmentsData) {
        try {
          const deptUsers = await AdminService.getUsersByDepartmentId(dept.id)
          allAssignedUsers.push(...deptUsers)
        } catch (error) {
          console.error(`Failed to fetch users for department ${dept.id}:`, error)
        }
      }
      setAssignedUsers(allAssignedUsers)

      // Refresh unassigned users
      const fleetManagersData = await AdminService.getFleetManagers()
      const unassignedFM = fleetManagersData.filter((fm) => fm.departmentName === null)
      setUnassignedFleetManagers(unassignedFM)

      const mechanicsData = await AdminService.getMechanics()
      const unassignedMech = mechanicsData.filter((m) => m.departmentName === null)
      setUnassignedMechanics(unassignedMech)

      const driversData = await AdminService.getDrivers()
      const unassignedDrv = driversData.filter((d) => d.departmentName === null)
      setUnassignedDrivers(unassignedDrv)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove user from department"
      toast.error(message)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-linear-to-br from-slate-950 via-slate-950/95 to-slate-900 text-slate-100"
          : "bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b border-white/10 ${
          isDark ? "bg-slate-900/50 backdrop-blur" : "bg-white/50 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.close()}
                className={isDark ? "hover:bg-white/10" : "hover:bg-slate-200"}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Shield size={32} className={isDark ? "text-blue-400" : "text-blue-600"} />
                  User Management Panel
                </h1>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                  Manage users and assign them to departments
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                /* TODO: Open create user dialog */
              }}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs Container */}
        <Tabs defaultValue="assigned" className="w-full">
          {/* Tabs List */}
          <TabsList className={`mb-6 grid w-full grid-cols-2 ${
            isDark
              ? "bg-slate-900/50 border border-white/10"
              : "bg-slate-100 border border-slate-200"
          }`}>
            <TabsTrigger value="assigned" className="gap-2">
              <CheckCircle2 size={18} />
              <span>Assigned Users</span>
              <Badge variant="secondary" className={`ml-1 ${
                isDark ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-100 text-emerald-700"
              }`}>
                {assignedUsers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="gap-2">
              <AlertCircle size={18} />
              <span>Unassigned Users</span>
              <Badge variant="secondary" className={`ml-1 ${
                isDark ? "bg-red-500/30 text-red-300" : "bg-red-100 text-red-700"
              }`}>
                {unassignedFleetManagers.length + unassignedMechanics.length + unassignedDrivers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Assigned Users Tab */}
          <TabsContent value="assigned" className="space-y-4">
            {/* Filters and Search */}
            <div className={`rounded-lg border p-4 ${
              isDark ? "border-white/10 bg-slate-900/30" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="space-y-3">
                <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Filters & Search
                </p>
                <div className="flex flex-col gap-3 md:flex-row">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                      size={18}
                    />
                    <Input
                      placeholder="Search by email or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 h-9 text-sm ${
                        isDark
                          ? "border-white/10 bg-slate-950/50 text-white placeholder:text-slate-500"
                          : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>

                  {/* Role Filter */}
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger
                      className={`w-full md:w-44 h-9 text-sm ${
                        isDark
                          ? "border-white/10 bg-slate-950/50 text-white"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <Filter size={14} />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-slate-900" : "bg-white"}>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                      <SelectItem value="MECHANIC">Mechanic</SelectItem>
                      <SelectItem value="DRIVER">Driver</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Department Filter */}
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger
                      className={`w-full md:w-44 h-9 text-sm ${
                        isDark
                          ? "border-white/10 bg-slate-950/50 text-white"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <Filter size={14} />
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-slate-900" : "bg-white"}>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Assigned Users Table */}
            <div className={`rounded-lg border overflow-hidden ${
              isDark ? "border-white/10 bg-slate-900/30" : "border-slate-200 bg-white"
            }`}>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                    Loading assigned users...
                  </p>
                </div>
              ) : filteredAssignedUsers.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                    {assignedUsers.length === 0 ? "No users assigned to departments yet." : "No users match your filters."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    {/* Table Header */}
                    <thead
                      className={`border-b border-white/10 ${
                        isDark ? "bg-slate-900/50" : "bg-slate-50"
                      }`}
                    >
                      <tr>
                        <th className={`px-5 py-3 text-left text-xs font-semibold ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          Email
                        </th>
                        <th className={`px-5 py-3 text-left text-xs font-semibold ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          Role
                        </th>
                        <th className={`px-5 py-3 text-left text-xs font-semibold ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          Department
                        </th>
                        <th className={`px-5 py-3 text-right text-xs font-semibold ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}>
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {filteredAssignedUsers.map((user, index) => (
                        <tr
                          key={`${user.id}-${user.departmentName}`}
                          className={`border-b border-white/5 transition-colors ${
                            index % 2 === 0
                              ? isDark
                                ? "bg-transparent"
                                : "bg-slate-50/50"
                              : isDark
                                ? "bg-slate-900/20"
                                : "bg-white"
                          } hover:${isDark ? "bg-slate-900/40" : "bg-slate-100"}`}
                        >
                          {/* Email */}
                          <td className={`px-5 py-3 font-medium ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}>
                            {user.email}
                          </td>

                          {/* Role */}
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role, isDark)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>

                          {/* Department */}
                          <td className={`px-5 py-3 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}>
                            {user.departmentName}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveFromDepartment(user)}
                                className="h-7 px-2 hover:bg-amber-500/20 text-amber-400"
                                title="Remove from department"
                              >
                                <LogOut size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user.id)}
                                className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400"
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Unassigned Users Tab */}
          <TabsContent value="unassigned" className="space-y-4">
            {unassignedFleetManagers.length === 0 && unassignedMechanics.length === 0 && unassignedDrivers.length === 0 ? (
              <div className={`rounded-lg border p-8 text-center ${
                isDark ? "border-white/10 bg-slate-900/30" : "border-slate-200 bg-white"
              }`}>
                <CheckCircle2 className={`mx-auto mb-2 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} size={32} />
                <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  All users assigned!
                </p>
                <p className={isDark ? "text-slate-400 text-sm mt-1" : "text-slate-600 text-sm mt-1"}>
                  Every user has been assigned to a department.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-1">
                {/* Unassigned Fleet Managers */}
                {unassignedFleetManagers.length > 0 && (
                  <div className={`rounded-lg border overflow-hidden ${
                    isDark ? "border-white/10 bg-slate-900/30" : "border-slate-200 bg-white"
                  }`}>
                    <div className={`px-5 py-3 border-b border-white/10 ${
                      isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                    }`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                        isDark ? "text-emerald-300" : "text-emerald-700"
                      }`}>
                        🚕 Fleet Managers
                        <Badge className={isDark ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-200 text-emerald-800"}>
                          {unassignedFleetManagers.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`border-b border-white/10 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                          <tr>
                            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</th>
                            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Role</th>
                            <th className={`px-5 py-3 text-right text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {unassignedFleetManagers.map((user, index) => (
                            <tr key={user.id} className={`transition-colors ${index % 2 === 0 ? isDark ? "bg-slate-900/20" : "bg-slate-50" : isDark ? "bg-slate-900/50" : "bg-white"} hover:${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                              <td className={`px-5 py-3 font-medium ${isDark ? "text-slate-200" : "text-slate-900"}`}>{user.email}</td>
                              <td className="px-5 py-3">
                                <Badge className={getRoleColor(user.role, isDark)}>
                                  {getRoleLabel(user.role)}
                                </Badge>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAssignUser(user)}
                                    className={`px-3 py-1 h-7 text-xs ${
                                      isDark
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                                  >
                                    Assign
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Unassigned Mechanics */}
                {unassignedMechanics.length > 0 && (
                  <div className={`rounded-lg border overflow-hidden ${
                    isDark ? "border-white/10 bg-slate-900/30" : "border-slate-200 bg-white"
                  }`}>
                    <div className={`px-5 py-3 border-b border-white/10 ${
                      isDark ? "bg-amber-500/10" : "bg-amber-50"
                    }`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                        isDark ? "text-amber-300" : "text-amber-700"
                      }`}>
                        🔧 Mechanics
                        <Badge className={isDark ? "bg-amber-500/30 text-amber-300" : "bg-amber-200 text-amber-800"}>
                          {unassignedMechanics.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`border-b border-white/10 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                          <tr>
                            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</th>
                            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Role</th>
                            <th className={`px-5 py-3 text-right text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {unassignedMechanics.map((user, index) => (
                            <tr key={user.id} className={`transition-colors ${index % 2 === 0 ? isDark ? "bg-slate-900/20" : "bg-slate-50" : isDark ? "bg-slate-900/50" : "bg-white"} hover:${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                              <td className={`px-5 py-3 font-medium ${isDark ? "text-slate-200" : "text-slate-900"}`}>{user.email}</td>
                              <td className="px-5 py-3">
                                <Badge className={getRoleColor(user.role, isDark)}>
                                  {getRoleLabel(user.role)}
                                </Badge>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAssignUser(user)}
                                    className={`px-3 py-1 h-7 text-xs ${
                                      isDark
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                                  >
                                    Assign
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Unassigned Drivers */}
                {unassignedDrivers.length > 0 && (
                  <div className={`rounded-lg border overflow-hidden ${
                    isDark ? "border-white/10 bg-slate-900/30" : "border-slate-200 bg-white"
                  }`}>
                    <div className={`px-5 py-3 border-b border-white/10 ${
                      isDark ? "bg-blue-500/10" : "bg-blue-50"
                    }`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${
                        isDark ? "text-blue-300" : "text-blue-700"
                      }`}>
                        🚗 Drivers
                        <Badge className={isDark ? "bg-blue-500/30 text-blue-300" : "bg-blue-200 text-blue-800"}>
                          {unassignedDrivers.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`border-b border-white/10 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}>
                          <tr>
                            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Email</th>
                            <th className={`px-5 py-3 text-left text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Role</th>
                            <th className={`px-5 py-3 text-right text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {unassignedDrivers.map((user, index) => (
                            <tr key={user.id} className={`transition-colors ${index % 2 === 0 ? isDark ? "bg-slate-900/20" : "bg-slate-50" : isDark ? "bg-slate-900/50" : "bg-white"} hover:${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
                              <td className={`px-5 py-3 font-medium ${isDark ? "text-slate-200" : "text-slate-900"}`}>{user.email}</td>
                              <td className="px-5 py-3">
                                <Badge className={getRoleColor(user.role, isDark)}>
                                  {getRoleLabel(user.role)}
                                </Badge>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAssignUser(user)}
                                    className={`px-3 py-1 h-7 text-xs ${
                                      isDark
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                                  >
                                    Assign
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent
          className={`${
            isDark
              ? "border-white/10 bg-slate-950/95 backdrop-blur"
              : "border-slate-200 bg-white/95 backdrop-blur"
          }`}
        >
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-slate-900"}>
              Assign User to Department
            </DialogTitle>
            <DialogDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
              {selectedUserForAssignment && (
                <>
                  Assigning <span className="font-semibold text-white">{selectedUserForAssignment.email}</span> to a department
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current User Info */}
            {selectedUserForAssignment && (
              <div className={`p-3 rounded-lg border ${
                isDark
                  ? "border-white/10 bg-slate-900/50"
                  : "border-slate-200 bg-slate-50"
              }`}>
                <div className="space-y-2">
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Email
                    </p>
                    <p className={isDark ? "text-white" : "text-slate-900"}>
                      {selectedUserForAssignment.email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Role
                    </p>
                    <Badge className={getRoleColor(selectedUserForAssignment.role, isDark)}>
                      {getRoleLabel(selectedUserForAssignment.role)}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Department Selection */}
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Select Department
              </label>
              <select
                value={selectedDepartmentForAssignment}
                onChange={(e) => setSelectedDepartmentForAssignment(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                  isDark
                    ? "border-white/10 bg-slate-900/50 text-white placeholder:text-slate-500"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                }`}
              >
                <option value="">Choose a department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className={isDark ? "border-white/10" : ""}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={isAssigning || !selectedDepartmentForAssignment}
              className={`${
                isDark
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isAssigning ? "Assigning..." : "Assign User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove from Department Alert Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className={`${
          isDark
            ? "border-white/10 bg-slate-950/95 backdrop-blur"
            : "border-slate-200 bg-white/95 backdrop-blur"
        }`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isDark ? "text-white" : "text-slate-900"}>
              Remove from Department?
            </AlertDialogTitle>
            <AlertDialogDescription className={isDark ? "text-slate-300" : "text-slate-600"}>
              {selectedUserForRemoval && (
                <>
                  <div className="mt-3 space-y-3">
                    <div className={`p-3 rounded-lg border ${
                      isDark
                        ? "border-white/10 bg-slate-900/50"
                        : "border-slate-200 bg-slate-50"
                    }`}>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            Email
                          </p>
                          <p className={isDark ? "text-white" : "text-slate-900"}>
                            {selectedUserForRemoval.email}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Role
                            </p>
                            <Badge className={getRoleColor(selectedUserForRemoval.role, isDark)}>
                              {getRoleLabel(selectedUserForRemoval.role)}
                            </Badge>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              Department
                            </p>
                            <Badge className={isDark ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-700"}>
                              {selectedUserForRemoval.departmentName}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      This will remove <span className="font-semibold">{selectedUserForRemoval.email}</span> from the <span className="font-semibold">{selectedUserForRemoval.departmentName}</span> department. They will become unassigned but their account will remain active.
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className={isDark ? "border-white/10" : ""}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoval}
              disabled={isRemoving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isRemoving ? "Removing..." : "Remove from Department"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminUserPanel
