import { useState } from "react"
import { useTheme } from "@/components/theme-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Search, Shield, UserCheck, Edit2, Save, X } from "lucide-react"

interface User {
  id: number
  email: string
  role: string
  departmentName?: string
  status: "active" | "inactive"
}

const AVAILABLE_ROLES = [
  { value: "ADMIN", label: "Administrator", color: "bg-red-500/20 text-red-300" },
  { value: "FLEET_MANAGER", label: "Fleet Manager", color: "bg-blue-500/20 text-blue-300" },
  { value: "MECHANIC", label: "Mechanic", color: "bg-purple-500/20 text-purple-300" },
  { value: "DRIVER", label: "Driver", color: "bg-emerald-500/20 text-emerald-300" },
]

interface AdminUserManagementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUserManagement({
  open,
  onOpenChange,
}: AdminUserManagementProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      email: "john.doe@autonode.com",
      role: "ADMIN",
      departmentName: "Administration",
      status: "active",
    },
    {
      id: 2,
      email: "jane.smith@autonode.com",
      role: "FLEET_MANAGER",
      departmentName: "Fleet Operations",
      status: "active",
    },
    {
      id: 3,
      email: "mike.wilson@autonode.com",
      role: "MECHANIC",
      departmentName: "Diagnostics",
      status: "active",
    },
    {
      id: 4,
      email: "sarah.johnson@autonode.com",
      role: "DRIVER",
      departmentName: "Driver Services",
      status: "inactive",
    },
    {
      id: 5,
      email: "robert.brown@autonode.com",
      role: "MECHANIC",
      departmentName: "Diagnostics",
      status: "active",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editingRole, setEditingRole] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditRole = (user: User) => {
    setEditingUserId(user.id)
    setEditingRole(user.role)
  }

  const handleSaveRole = async (userId: number) => {
    if (!editingRole) {
      toast.error("Please select a role")
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: editingRole } : user
        )
      )

      toast.success("User role updated successfully")
      setEditingUserId(null)
      setEditingRole("")
    } catch {
      toast.error("Failed to update user role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditingRole("")
  }

  const getRoleColor = (role: string) => {
    const roleConfig = AVAILABLE_ROLES.find((r) => r.value === role)
    return roleConfig?.color || "bg-slate-500/20 text-slate-300"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-6xl! w-[90vw]! max-h-[85vh]! flex flex-col gap-0 p-0 ${
          isDark
            ? "border-white/10 bg-slate-950/95 backdrop-blur"
            : "border-slate-200 bg-white/95 backdrop-blur"
        }`}
      >
        <DialogHeader className="border-b border-white/10 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className={isDark ? "text-blue-400" : "text-blue-600"} size={24} />
            <div>
              <DialogTitle className={isDark ? "text-white" : "text-slate-900"}>
                Assign Roles & Access Control
              </DialogTitle>
              <DialogDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>
                Manage user roles and permissions across your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 shrink-0 sticky top-0 z-10 bg-inherit pb-2">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
                size={18}
              />
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${
                  isDark
                    ? "border-white/10 bg-slate-900/50 text-white placeholder:text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500"
                }`}
              />
            </div>
          </div>

          {/* Horizontal Scrollable User Cards */}
          <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
            {filteredUsers.length === 0 ? (
              <div className="flex w-full items-center justify-center py-16">
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                  No users found matching your search
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex min-w-80 flex-col gap-4 rounded-lg border p-4 transition-all ${
                    isDark
                      ? "border-white/10 bg-slate-900/50 hover:border-blue-500/30 hover:bg-slate-800/70"
                      : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white"
                  }`}
                >
                  {/* User Info Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          isDark ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {user.email}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        ID: {user.id}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        user.status === "active"
                          ? isDark
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-emerald-300 bg-emerald-100 text-emerald-700"
                          : isDark
                            ? "border-slate-500/30 bg-slate-500/10 text-slate-400"
                            : "border-slate-300 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.status === "active" ? (
                        <span className="flex items-center gap-1">
                          <UserCheck size={12} />
                          Active
                        </span>
                      ) : (
                        <span>Inactive</span>
                      )}
                    </Badge>
                  </div>

                  {/* Department Info */}
                  {user.departmentName && (
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Department
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        {user.departmentName}
                      </p>
                    </div>
                  )}

                  {/* Role Management Section */}
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <Label className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Current Role
                    </Label>

                    {editingUserId === user.id ? (
                      <div className="space-y-2">
                        <Select value={editingRole} onValueChange={setEditingRole}>
                          <SelectTrigger
                            className={
                              isDark
                                ? "border-white/10 bg-slate-800 text-white"
                                : "border-slate-200 bg-white text-slate-900"
                            }
                          >
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent
                            className={isDark ? "bg-slate-900" : "bg-white"}
                          >
                            {AVAILABLE_ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveRole(user.id)}
                            disabled={isSubmitting}
                            className={`flex-1 gap-1 ${
                              isDark
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            }`}
                          >
                            <Save size={14} />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className={`flex-1 gap-1 ${
                              isDark
                                ? "border-white/20 text-slate-200 hover:bg-white/10"
                                : "border-slate-300 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <X size={14} />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge className={getRoleColor(user.role)}>
                          {AVAILABLE_ROLES.find((r) => r.value === user.role)?.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(user)}
                          className={`w-full gap-2 ${
                            isDark
                              ? "border-white/20 text-slate-200 hover:bg-white/10"
                              : "border-slate-300 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Edit2 size={14} />
                          Change Role
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`border-t border-white/10 px-6 py-4 shrink-0 ${
            isDark ? "bg-slate-900/50" : "bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className={
                isDark
                  ? "bg-slate-700 text-white hover:bg-slate-600"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminUserManagement
