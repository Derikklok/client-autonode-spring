import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { useTheme } from "@/components/theme-context"
import { DepartmentService } from "@/components/api/department.service"
import type { Department } from "@/types/department.types"
import { Badge } from "@/components/ui/badge"

interface ViewAllDepartmentsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewAllDepartmentsDrawer({
  open,
  onOpenChange,
}: ViewAllDepartmentsDrawerProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchDepartments()
    }
  }, [open])

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      const data = await DepartmentService.getAll()
      setDepartments(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch departments"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={`${
          isDark
            ? "border-white/10 bg-slate-950 text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <DrawerHeader className="border-b border-white/10 pb-4">
          <DrawerTitle
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            📋 All Departments
          </DrawerTitle>
          <DrawerDescription
            className={isDark ? "text-slate-200/70" : "text-slate-600"}
          >
            {departments.length} department{departments.length !== 1 ? "s" : ""} in your organization
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  ⏳ Loading departments...
                </p>
              </div>
            </div>
          ) : departments.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <p
                  className={`text-lg font-semibold ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  📭 No departments found
                </p>
                <p
                  className={`mt-2 text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Create your first department to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className={`group flex flex-col overflow-hidden rounded-xl border transition-all duration-300 ${
                    isDark
                      ? "border-white/10 bg-slate-900/50 hover:border-amber-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-amber-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-white hover:shadow-lg hover:shadow-amber-400/20"
                  }`}
                >
                  {/* Image Section */}
                  {department.imageUrl ? (
                    <div className="relative overflow-hidden bg-linear-to-br from-slate-400 to-slate-500 h-48 w-full">
                      <img
                        src={department.imageUrl}
                        alt={department.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className={`flex h-48 items-center justify-center ${
                      isDark
                        ? "bg-linear-to-br from-slate-800 to-slate-900"
                        : "bg-linear-to-br from-slate-200 to-slate-300"
                    }`}>
                      <span className="text-4xl">📁</span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="space-y-2">
                      <h3
                        className={`text-base font-bold line-clamp-1 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {department.name}
                      </h3>
                      {department.description && (
                        <p
                          className={`line-clamp-2 text-xs leading-relaxed ${
                            isDark
                              ? "text-slate-200/60"
                              : "text-slate-600"
                          }`}
                        >
                          {department.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Section */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                          👤 By:
                        </span>
                        <span className={`text-xs truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {department.createdBy}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          📅 Date:
                        </span>
                        <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {new Date(department.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* ID Badge */}
                    <div className="mt-3">
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono ${
                          isDark
                            ? "border-sky-400/30 bg-sky-400/10 text-sky-300"
                            : "border-sky-300/30 bg-sky-100 text-sky-700"
                        }`}
                      >
                        ID: {department.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ViewAllDepartmentsDrawer
