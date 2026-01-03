import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Search, Shield, Users, BarChart3 } from "lucide-react"
import { DepartmentService } from "@/components/api/department.service"
import type { DepartmentDetails } from "@/types/department.types"

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

  const [departments, setDepartments] = useState<DepartmentDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDetails | null>(null)

  useEffect(() => {
    if (open) {
      fetchDepartments()
    }
  }, [open])

  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const data = await DepartmentService.getAllWithDetails()
      setDepartments(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch departments"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDepartmentClick = (dept: DepartmentDetails) => {
    setSelectedDepartment(dept)
  }

  const handleDone = () => {
    if (selectedDepartment) {
      const url = `/admin/department/users?departmentId=${selectedDepartment.id}&departmentName=${encodeURIComponent(selectedDepartment.name)}`
      window.open(url, "_blank", "width=1200,height=800,resizable=yes,scrollbars=yes")
      setSelectedDepartment(null)
      setSearchQuery("")
      onOpenChange(false)
    } else {
      toast.error("Please select a department first")
    }
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
                Department Management
              </DialogTitle>
              <DialogDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>
                View departments and their user counts. Click to see more details.
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
                placeholder="Search departments..."
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

          {/* Loading State */}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                Loading departments...
              </p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                No departments found
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => handleDepartmentClick(dept)}
                  className={`group cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                    isDark
                      ? "border-white/10 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-blue-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:shadow-blue-400/20"
                  } ${
                    selectedDepartment?.id === dept.id
                      ? isDark
                        ? "border-blue-500 bg-slate-800 ring-1 ring-blue-500/50"
                        : "border-blue-400 bg-blue-50 ring-1 ring-blue-400/50"
                      : ""
                  }`}
                >
                  {/* Department Name */}
                  <h3
                    className={`text-lg font-semibold transition-colors ${
                      isDark
                        ? "text-white group-hover:text-blue-400"
                        : "text-slate-900 group-hover:text-blue-600"
                    }`}
                  >
                    {dept.name}
                  </h3>

                  {/* Description */}
                  <p
                    className={`mt-1 text-sm line-clamp-2 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {dept.description}
                  </p>

                  {/* User Counts Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                    {/* Total Users */}
                    <div
                      className={`rounded-md p-2 ${
                        isDark
                          ? "bg-white/5"
                          : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Users size={14} className={isDark ? "text-blue-400" : "text-blue-600"} />
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Total
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {dept.totalUserCount}
                      </p>
                    </div>

                    {/* Fleet Managers */}
                    <div
                      className={`rounded-md p-2 ${
                        isDark
                          ? "bg-white/5"
                          : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <BarChart3 size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Managers
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                        {dept.fleetManagerCount}
                      </p>
                    </div>

                    {/* Mechanics */}
                    <div
                      className={`rounded-md p-2 ${
                        isDark
                          ? "bg-white/5"
                          : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <BarChart3 size={14} className={isDark ? "text-amber-400" : "text-amber-600"} />
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Mechanics
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${isDark ? "text-amber-300" : "text-amber-600"}`}>
                        {dept.mechanicCount}
                      </p>
                    </div>

                    {/* Drivers */}
                    <div
                      className={`rounded-md p-2 ${
                        isDark
                          ? "bg-white/5"
                          : "bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <BarChart3 size={14} className={isDark ? "text-purple-400" : "text-purple-600"} />
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Drivers
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${isDark ? "text-purple-300" : "text-purple-600"}`}>
                        {dept.driverCount}
                      </p>
                    </div>
                  </div>

                  {/* Click Indicator */}
                  <p
                    className={`mt-3 text-xs font-medium transition-colors ${
                      isDark
                        ? "text-slate-500 group-hover:text-blue-400"
                        : "text-slate-400 group-hover:text-blue-600"
                    }`}
                  >
                    Click for details →
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t border-white/10 px-6 py-4 shrink-0 ${
            isDark ? "bg-slate-900/50" : "bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {selectedDepartment
                ? `Selected: ${selectedDepartment.name} (${selectedDepartment.totalUserCount} users)`
                : `${filteredDepartments.length} of ${departments.length} departments`}
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.open("/admin/users", "_blank", "width=1400,height=900,resizable=yes,scrollbars=yes")}
                variant="outline"
                className={`gap-2 ${
                  isDark
                    ? "border-white/20 text-slate-200 hover:bg-white/10"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Users size={16} />
                Go to Management Panel
              </Button>
              <Button
                onClick={handleDone}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Shield size={16} />
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminUserManagement
