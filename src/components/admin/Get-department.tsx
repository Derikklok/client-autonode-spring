import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-context"
import { DepartmentService } from "@/components/api/department.service"
import type { Department, DepartmentUser, DepartmentDetails } from "@/types/department.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Edit2, Trash2, X, Users, BarChart3 } from "lucide-react"
import { toast } from "sonner"

type ViewMode = "grid" | "list"
type DialogState = "closed" | "create" | "edit" | "view"

function Getdepartment() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentDetails, setDepartmentDetails] = useState<DepartmentDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogState, setDialogState] = useState<DialogState>("closed")
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", image: null as File | null })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [departmentUsers, setDepartmentUsers] = useState<DepartmentUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const itemsPerPage = 6

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await DepartmentService.getAll()
      setDepartments(data)
      
      // Also fetch department details
      setIsLoadingDetails(true)
      const detailsData = await DepartmentService.getAllWithDetails()
      setDepartmentDetails(detailsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch departments"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
      setIsLoadingDetails(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleOpenCreate = () => {
    setFormData({ name: "", description: "", image: null })
    setImagePreview(null)
    setSelectedDepartment(null)
    setDialogState("create")
  }

  const handleOpenEdit = (department: Department) => {
    setFormData({ name: department.name, description: department.description, image: null })
    setImagePreview(department.imageUrl)
    setSelectedDepartment(department)
    setDialogState("edit")
  }

  const handleOpenView = (department: Department) => {
    setSelectedDepartment(department)
    setDialogState("view")
    fetchDepartmentUsers(department.id)
  }

  const fetchDepartmentUsers = async (departmentId: number) => {
    try {
      setIsLoadingUsers(true)
      const users = await DepartmentService.getUsersByDepartmentId(departmentId)
      setDepartmentUsers(users)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch users"
      toast.error(message)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleCloseDialog = () => {
    setDialogState("closed")
    setSelectedDepartment(null)
    setFormData({ name: "", description: "", image: null })
    setImagePreview(null)
    setDepartmentUsers([])
  }

  // Pagination calculations
  const totalPages = Math.ceil(departments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDepartments = departments.slice(startIndex, endIndex)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateDepartment = async () => {
    if (!formData.name.trim()) {
      toast.error("Department name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const department = await DepartmentService.create({
        name: formData.name,
        description: formData.description,
      })
      
      if (formData.image) {
        await DepartmentService.updateImage(department.id, formData.image)
      }
      
      toast.success("Department created successfully")
      await fetchDepartments()
      handleCloseDialog()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create department"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !formData.name.trim()) {
      toast.error("Department name is required")
      return
    }

    setIsSubmitting(true)
    try {
      await DepartmentService.update(selectedDepartment.id, {
        name: formData.name,
        description: formData.description,
      })
      
      if (formData.image) {
        await DepartmentService.updateImage(selectedDepartment.id, formData.image)
      }
      
      toast.success("Department updated successfully")
      await fetchDepartments()
      handleCloseDialog()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update department"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async (departmentId: number) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return
    }

    try {
      await DepartmentService.delete(departmentId)
      toast.success("Department deleted successfully")
      await fetchDepartments()
      handleCloseDialog()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete department"
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-sky-500 mx-auto"></div>
          <p>Loading departments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={`${isDark ? "border-red-500/30 bg-red-500/10" : "border-red-300 bg-red-50"}`}>
        <CardHeader>
          <CardTitle className={isDark ? "text-red-400" : "text-red-700"}>Error Loading Departments</CardTitle>
          <CardDescription className={isDark ? "text-red-300/70" : "text-red-600"}>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (departments.length === 0) {
    return (
      <Card className={isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/70"}>
        <CardHeader className="text-center py-12">
          <CardTitle className={isDark ? "text-slate-300" : "text-slate-700"}>No Departments Found</CardTitle>
          <CardDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
            Create your first department to get started
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold tracking-tight ${isDark ? "bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent" : "bg-linear-to-r from-amber-600 via-amber-500 to-amber-400 bg-clip-text text-transparent"}`}>
              Departments
            </div>
          </div>
          <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Manage and view all departments across your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`text-sm font-semibold px-3 py-1 ${isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-300"}`}>
            {departments.length} active
          </Badge>
        <Button
            onClick={handleOpenCreate}
            className={`font-semibold transition-all duration-200 flex items-center gap-2 ${isDark ? "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/50" : "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/50"}`}
        >
            <Plus size={18} />
            Create Department
        </Button>
          <div className={`flex gap-2 rounded-xl p-1 backdrop-blur-sm ${isDark ? "bg-white/10 border border-white/20" : "bg-white/50 border border-slate-200"}`}>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? isDark
                    ? "bg-linear-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                    : "bg-linear-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                  : isDark
                    ? "text-slate-300 hover:text-slate-100 hover:bg-white/10"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "list"
                  ? isDark
                    ? "bg-linear-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                    : "bg-linear-to-r from-sky-500 to-cyan-500 text-white shadow-lg"
                  : isDark
                    ? "text-slate-300 hover:text-slate-100 hover:bg-white/10"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white"
              }`}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      <Separator className={isDark ? "border-white/10" : "border-slate-200"} />

    {/* Grid View */}
    {viewMode === "grid" && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDepartments.map((department) => (
        <Card
          key={department.id}
          className={`group overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
            isDark
            ? "border-white/10 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 hover:border-amber-500/50"
            : "border-slate-300 bg-linear-to-br from-slate-100 via-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 hover:border-amber-400"
          }`}
        >
          {/* Department Image */}
          {department.imageUrl && (
            <div className="relative h-48 w-full overflow-hidden bg-linear-to-br from-slate-700 to-slate-800 dark:from-slate-950 dark:to-slate-900">
            <img
              src={department.imageUrl}
              alt={department.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%2364748b'%3E${department.name}%3C/text%3E%3C/svg%3E`
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
            <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold transition-all ${isDark ? "bg-amber-500/80 text-amber-950 backdrop-blur-sm" : "bg-amber-400 text-amber-900 backdrop-blur-sm"}`}>
              ID #{department.id}
            </div>
            </div>
          )}

              <CardHeader className="pb-2">
                <div className="space-y-2">
                  <CardTitle className={`line-clamp-2 text-lg font-bold transition-colors ${isDark ? "text-slate-100 group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-600"}`}>
                    {department.name}
                  </CardTitle>
                  <CardDescription className={`line-clamp-2 text-sm ${isDark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600 group-hover:text-slate-700"}`}>
                    {department.description || "No description provided"}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                {/* Meta Information */}
                <div className={`rounded-lg p-3 backdrop-blur-sm transition-all ${isDark ? "bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-amber-500/30" : "bg-slate-100/50 border border-slate-200/50 group-hover:bg-slate-200/50"}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-500"}`}>Created By</p>
                      <p className={`text-sm font-bold truncate ${isDark ? "text-slate-100 group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-600"}`}>
                        {department.createdBy.split('@')[0]}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-500"}`}>Date</p>
                      <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {new Date(department.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Actions */}
              <div className={`flex gap-2 border-t px-4 py-3 transition-all ${isDark ? "border-white/10 bg-white/5 group-hover:bg-white/10" : "border-slate-200 bg-slate-50/50 group-hover:bg-white"}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenView(department)}
                  className={`flex-1 font-semibold transition-all ${
                    isDark
                      ? "border-white/20 text-slate-200 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/50"
                      : "border-slate-300 text-slate-700 hover:bg-sky-100 hover:text-sky-700 hover:border-sky-300"
                  }`}
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(department)}
                  className={`flex-1 font-semibold transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? "border-white/20 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50"
                      : "border-slate-300 text-slate-700 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300"
                  }`}
                >
                    <Edit2 size={16} />
                    Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {paginatedDepartments.map((department) => (
            <Card
              key={department.id}
              className={`group transition-all duration-300 transform hover:scale-102 hover:shadow-lg border-l-4 ${
                isDark
                  ? "border-white/10 border-l-amber-500 bg-linear-to-r from-slate-800 to-slate-800 hover:from-slate-700 hover:to-slate-800 hover:border-white/20"
                  : "border-slate-200 border-l-amber-400 bg-linear-to-r from-white to-slate-50 hover:from-slate-50 hover:to-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {department.imageUrl && (
                    <img
                      src={department.imageUrl}
                      alt={department.name}
                      className="h-14 w-14 rounded-lg object-cover shrink-0 ring-2 ring-amber-500/30 group-hover:ring-amber-500/60 transition-all"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3C/svg%3E`
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold line-clamp-1 text-base transition-colors ${isDark ? "text-slate-100 group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-600"}`}>
                      {department.name}
                    </h4>
                    <p className={`text-sm line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {department.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <div className={`px-3 py-2 rounded-lg backdrop-blur-sm transition-all ${isDark ? "bg-white/5 border border-white/10 group-hover:border-amber-500/30 group-hover:bg-white/10" : "bg-slate-100/50 border border-slate-200/50 group-hover:border-amber-300 group-hover:bg-amber-50"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-600"}`}>Created</p>
                    <p className={`text-sm font-bold ${isDark ? "text-slate-200 group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-600"}`}>
                      {new Date(department.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenView(department)}
                      className={`font-semibold transition-all flex items-center gap-2 ${isDark ? "border-white/20 text-slate-200 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/50" : "border-slate-300 text-slate-700 hover:bg-sky-100 hover:text-sky-700 hover:border-sky-300"}`}
                    >
                      <Eye size={16} />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(department)}
                      className={`font-semibold transition-all flex items-center gap-2 ${isDark ? "border-white/20 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50" : "border-slate-300 text-slate-700 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-300"}`}
                    >
                      <Edit2 size={16} />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8 pb-2">
          <Pagination>
            <PaginationContent className={`gap-2 ${isDark ? "bg-slate-800/50 rounded-lg px-4 py-2" : "bg-slate-100/50 rounded-lg px-4 py--2"}`}>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={`font-semibold transition-all hover:scale-105 ${currentPage === 1 ? "pointer-events-none opacity-50" : `cursor-pointer ${isDark ? "text-slate-200 hover:text-amber-400" : "text-slate-700 hover:text-amber-600"}`}`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={page === currentPage}
                    className={`font-semibold transition-all hover:scale-105 ${
                      page === currentPage
                        ? isDark
                          ? "bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/50"
                          : "bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                        : `cursor-pointer ${isDark ? "text-slate-200 hover:bg-amber-500/20 hover:text-amber-400" : "text-slate-700 hover:bg-amber-100 hover:text-amber-700"}`
                    }`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`font-semibold transition-all hover:scale-105 ${currentPage === totalPages ? "pointer-events-none opacity-50" : `cursor-pointer ${isDark ? "text-slate-200 hover:text-amber-400" : "text-slate-700 hover:text-amber-600"}`}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>

    {/* Department Details Table */}
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BarChart3 size={28} className={isDark ? "text-amber-400" : "text-amber-600"} />
          <h2 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Department Overview
          </h2>
        </div>
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          View user count breakdown by department
        </p>
      </div>

      {isLoadingDetails ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>Loading department details...</p>
        </div>
      ) : departmentDetails.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-slate-900/50" : "border-slate-200 bg-slate-50"}`}>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>No departments found</p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${isDark ? "border-white/10 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
          <Table>
            <TableHeader>
              <TableRow className={isDark ? "border-white/10 hover:bg-transparent" : "border-slate-200 hover:bg-transparent"}>
                <TableHead className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>Department Name</TableHead>
                <TableHead className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>Description</TableHead>
                <TableHead className={`text-center font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>Fleet Managers</TableHead>
                <TableHead className={`text-center font-semibold ${isDark ? "text-purple-400" : "text-purple-600"}`}>Mechanics</TableHead>
                <TableHead className={`text-center font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>Drivers</TableHead>
                <TableHead className={`text-center font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Total Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentDetails.map((dept) => (
                <TableRow
                  key={dept.id}
                  className={`transition-colors ${
                    isDark
                      ? "border-white/10 hover:bg-white/5"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <TableCell className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {dept.name}
                  </TableCell>
                  <TableCell className={`max-w-xs truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {dept.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Badge className={`${
                        dept.fleetManagerCount > 0
                          ? isDark
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-blue-100 text-blue-700 border border-blue-300"
                          : isDark
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-200 text-slate-500"
                      } font-semibold`}>
                        {dept.fleetManagerCount}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Badge className={`${
                        dept.mechanicCount > 0
                          ? isDark
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-purple-100 text-purple-700 border border-purple-300"
                          : isDark
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-200 text-slate-500"
                      } font-semibold`}>
                        {dept.mechanicCount}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Badge className={`${
                        dept.driverCount > 0
                          ? isDark
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : isDark
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-200 text-slate-500"
                      } font-semibold`}>
                        {dept.driverCount}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Badge className={`${
                        dept.totalUserCount > 0
                          ? isDark
                            ? "bg-slate-600 text-slate-100 border border-slate-500"
                            : "bg-slate-300 text-slate-800 border border-slate-400"
                          : isDark
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-200 text-slate-500"
                      } font-semibold`}>
                        {dept.totalUserCount}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>

    {/* Create/Edit Dialog */}
    <Dialog open={dialogState === "create" || dialogState === "edit"} onOpenChange={(open) => !open && handleCloseDialog()}>
      <DialogContent className={`sm:max-w-md ${isDark ? "bg-linear-to-br from-slate-950 via-slate-950 to-slate-900 border-white/10" : "bg-linear-to-br from-white via-slate-50 to-white border-slate-200"}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold transition-all ${isDark ? "bg-linear-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent" : "bg-linear-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent"}`}>
            {dialogState === "create" ? "Create Department" : "Edit Department"}
          </DialogTitle>
          <DialogDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
            {dialogState === "create"
              ? "Add a new department to your organization"
              : "Update department information"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Department Name</Label>
            <Input
              placeholder="Enter department name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`transition-all font-medium ${isDark ? "border-white/20 bg-white/5 text-slate-100 focus:border-amber-500 focus:ring-amber-500/20 focus:bg-white/10" : "border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 focus:bg-slate-50"}`}
            />
          </div>

          <div className="space-y-2">
            <Label className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Description</Label>
            <textarea
              placeholder="Enter department description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`min-h-24 w-full rounded-md border px-3 py-2 font-medium transition-all ${isDark ? "border-white/20 bg-white/5 text-slate-100 focus:border-amber-500 focus:ring-amber-500/20 focus:bg-white/10" : "border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 focus:bg-slate-50"}`}
            />
          </div>

          <div className="space-y-2">
            <Label className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}>Department Image</Label>
            {imagePreview && (
              <div className="relative h-40 w-full overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={isDark ? "border-white/20 bg-white/5 text-slate-100" : "border-slate-300"}
            />
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Upload a department image (optional)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            className={`flex items-center gap-2 font-semibold transition-all ${isDark ? "border-white/20 text-slate-200 hover:bg-white/10" : "border-slate-300 hover:bg-slate-100"}`}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            onClick={dialogState === "create" ? handleCreateDepartment : handleUpdateDepartment}
            disabled={isSubmitting}
            className={`font-semibold transition-all ${isDark ? "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 disabled:opacity-50" : "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"}`}
          >
            {isSubmitting ? "Saving..." : dialogState === "create" ? "Create" : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* View Details Dialog */}
    <Dialog open={dialogState === "view"} onOpenChange={(open) => !open && handleCloseDialog()}>
      <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${isDark ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"}`}>
        <DialogHeader className="shrink-0">
          <DialogTitle className={`text-xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            {selectedDepartment?.name}
          </DialogTitle>
          <DialogDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
            Department Details
          </DialogDescription>
        </DialogHeader>

        {selectedDepartment && (
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-4">
            {selectedDepartment.imageUrl && (
              <div className={`relative h-40 w-full overflow-hidden rounded-lg border-2 shrink-0 ${isDark ? "border-amber-500/50" : "border-amber-400"}`}>
                <img
                  src={selectedDepartment.imageUrl}
                  alt={selectedDepartment.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3C/svg%3E`
                  }}
                />
              </div>
            )}

            <div className={`space-y-2 rounded-lg px-4 py-2.5 ${isDark ? "bg-slate-900 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-600"}`}>Name</p>
              <p className={`text-base font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {selectedDepartment.name}
              </p>
            </div>

            <div className={`space-y-2 rounded-lg px-4 py-2.5 ${isDark ? "bg-slate-900 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-600"}`}>Description</p>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {selectedDepartment.description || "No description provided"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-900 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-600"}`}>Created By</p>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{selectedDepartment.createdBy}</p>
              </div>

              <div className={`rounded-lg px-3 py-2 ${isDark ? "bg-slate-900 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-600"}`}>Created Date</p>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {new Date(selectedDepartment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Department Users Section */}
            <Separator className={isDark ? "bg-white/10" : "bg-slate-200"} />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className={isDark ? "text-slate-300" : "text-slate-700"} />
                  <h3 className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    Department Users ({departmentUsers.length})
                  </h3>
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading users...</p>
                </div>
              ) : departmentUsers.length === 0 ? (
                <div className={`rounded-lg border-2 border-dashed px-3 py-3 text-center ${isDark ? "border-white/10 bg-slate-900/50" : "border-slate-300 bg-slate-50"}`}>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No users assigned to this department</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {departmentUsers.map((user) => {
                    const roleColors: Record<string, { bg: string; text: string; border: string }> = {
                      ADMIN: { bg: isDark ? "bg-red-950" : "bg-red-50", text: isDark ? "text-red-400" : "text-red-700", border: isDark ? "border-red-800" : "border-red-200" },
                      FLEET_MANAGER: { bg: isDark ? "bg-blue-950" : "bg-blue-50", text: isDark ? "text-blue-400" : "text-blue-700", border: isDark ? "border-blue-800" : "border-blue-200" },
                      MECHANIC: { bg: isDark ? "bg-purple-950" : "bg-purple-50", text: isDark ? "text-purple-400" : "text-purple-700", border: isDark ? "border-purple-800" : "border-purple-200" },
                      DRIVER: { bg: isDark ? "bg-emerald-950" : "bg-emerald-50", text: isDark ? "text-emerald-400" : "text-emerald-700", border: isDark ? "border-emerald-800" : "border-emerald-200" },
                    }
                    const roleColor = roleColors[user.role] || roleColors.DRIVER

                    return (
                      <div
                        key={user.id}
                        className={`flex flex-col items-start justify-between rounded-lg border px-3 py-2.5 transition-all ${roleColor.bg} ${roleColor.border} ${roleColor.text}`}
                      >
                        <p className={`text-xs font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {user.email}
                        </p>
                        <div className="flex items-center justify-between w-full mt-1 gap-2">
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            ID: {user.id}
                          </p>
                          <Badge
                            className={`${roleColor.bg} ${roleColor.text} border ${roleColor.border} font-semibold text-xs py-0 px-2`}
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`shrink-0 flex justify-between gap-3 border-t pt-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <Button
            variant="destructive"
            onClick={() => selectedDepartment && handleDeleteDepartment(selectedDepartment.id)}
            className="flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105"
            size="sm"
          >
            <Trash2 size={16} />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className={`flex items-center gap-2 text-sm font-semibold transition-all ${isDark ? "border-white/20 text-slate-200 hover:bg-white/10" : "border-slate-300 hover:bg-slate-100"}`}
              size="sm"
            >
              <X size={16} />
              Close
            </Button>
            <Button
              onClick={() => {
                setDialogState("edit")
              }}
              className={`flex items-center gap-2 text-sm font-semibold transition-all ${isDark ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              size="sm"
            >
              <Edit2 size={16} />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default Getdepartment