import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTheme } from "@/components/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Search, Users, ArrowLeft, Shield, Mail } from "lucide-react"
import { AdminService } from "@/components/api/admin.service"
import type { AdminUser } from "@/types/admin.types"

interface UserWithColor extends AdminUser {
  roleColor: string
  roleBgColor: string
}

const getRoleInfo = (role: string, isDark: boolean) => {
  const roleConfigs: Record<string, { label: string; color: string; bgColor: string }> = {
    FLEET_MANAGER: {
      label: "Fleet Manager",
      color: isDark ? "text-emerald-400" : "text-emerald-700",
      bgColor: isDark ? "bg-emerald-500/20" : "bg-emerald-100",
    },
    MECHANIC: {
      label: "Mechanic",
      color: isDark ? "text-amber-400" : "text-amber-700",
      bgColor: isDark ? "bg-amber-500/20" : "bg-amber-100",
    },
    DRIVER: {
      label: "Driver",
      color: isDark ? "text-blue-400" : "text-blue-700",
      bgColor: isDark ? "bg-blue-500/20" : "bg-blue-100",
    },
    ADMIN: {
      label: "Administrator",
      color: isDark ? "text-purple-400" : "text-purple-700",
      bgColor: isDark ? "bg-purple-500/20" : "bg-purple-100",
    },
  }
  return roleConfigs[role] || roleConfigs.DRIVER
}

export function AdminUserPage() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const departmentId = searchParams.get("departmentId")
  const departmentName = searchParams.get("departmentName")

  const [users, setUsers] = useState<UserWithColor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchUsers = async () => {
    if (!departmentId) return

    setIsLoading(true)
    try {
      const data = await AdminService.getUsersByDepartmentId(Number(departmentId))
      const usersWithColors = data.map((user) => {
        const roleInfo = getRoleInfo(user.role, isDark)
        return {
          ...user,
          roleColor: roleInfo.color,
          roleBgColor: roleInfo.bgColor,
        }
      })
      setUsers(usersWithColors)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch users"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!departmentId) {
      toast.error("Department ID not provided")
      navigate("/", { replace: true })
      return
    }

    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, navigate])

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                  <Users size={32} className={isDark ? "text-blue-400" : "text-blue-600"} />
                  Department Users
                </h1>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                  {departmentName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              size={20}
            />
            <Input
              placeholder="Search by email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-12 h-11 ${
                isDark
                  ? "border-white/10 bg-slate-900/50 text-white placeholder:text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500"
              }`}
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                {users.length === 0 ? "No users found in this department" : "No users match your search"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role, isDark)
              return (
                <div
                  key={user.id}
                  className={`group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 ${
                    isDark
                      ? "border-white/10 bg-slate-900/50 hover:border-blue-500/30 hover:bg-slate-800/70"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white"
                  }`}
                >
                  <div className="flex flex-1 items-center gap-4">
                    {/* User Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isDark ? "bg-white/10" : "bg-slate-200"
                      }`}
                    >
                      <Mail
                        size={20}
                        className={isDark ? "text-slate-400" : "text-slate-600"}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {user.email}
                      </p>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        ID: {user.id}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className={`rounded-full px-4 py-2 ${roleInfo.bgColor}`}>
                    <span className={`flex items-center gap-2 text-sm font-medium ${roleInfo.color}`}>
                      <Shield size={16} />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Stats */}
        {users.length > 0 && (
          <div
            className={`mt-8 rounded-lg border border-white/10 p-6 ${
              isDark ? "bg-slate-900/30" : "bg-slate-100/50"
            }`}
          >
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Total Users
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-500">{users.length}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Fleet Managers
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-500">
                  {users.filter((u) => u.role === "FLEET_MANAGER").length}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Mechanics
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-500">
                  {users.filter((u) => u.role === "MECHANIC").length}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Drivers
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-500">
                  {users.filter((u) => u.role === "DRIVER").length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUserPage
