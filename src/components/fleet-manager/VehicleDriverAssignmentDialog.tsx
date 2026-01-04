import { useState } from "react"
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
import { AlertCircle, CheckCircle, Users, UserPlus, Trash2, Shield } from "lucide-react"

interface Driver {
  id: string
  name: string
  email: string
  phone: string
  role: "driver" | "mechanic" | "manager"
  status: "active" | "inactive" | "on-leave"
  licenseNumber: string
  assignedVehicles: number
  rating: number
}

// Mock drivers data - replace with actual API call
const mockDrivers: Driver[] = [
  {
    id: "1",
    name: "John Anderson",
    email: "john.anderson@autonodefl.com",
    phone: "+1 (713) 555-0142",
    role: "driver",
    status: "active",
    licenseNumber: "TX-DL-2024-001",
    assignedVehicles: 1,
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
    assignedVehicles: 1,
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
    assignedVehicles: 1,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Michael Thompson",
    email: "michael.thompson@autonodefl.com",
    phone: "+1 (832) 555-0167",
    role: "driver",
    status: "on-leave",
    licenseNumber: "TX-DL-2024-005",
    assignedVehicles: 0,
    rating: 4.5,
  },
]

interface VehicleDriverAssignmentDialogProps {
  vehicle: { plateNumber: string; manufacturer: string; model: string }
  isDark: boolean
  isOpen: boolean
  currentDriver: string | null
  onClose: () => void
  onAssign?: (driverName: string) => void
  onRemove?: () => void
}

export function VehicleDriverAssignmentDialog({
  vehicle,
  isDark,
  isOpen,
  currentDriver,
  onClose,
  onAssign,
  onRemove,
}: VehicleDriverAssignmentDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const filteredDrivers = mockDrivers.filter((driver) => {
    return (
      driver.role === "driver" &&
      (driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const handleAssignDriver = async (driver: Driver) => {
    try {
      setIsAssigning(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      setSuccessMessage(`${driver.name} assigned successfully`)
      setTimeout(() => {
        onAssign?.(driver.name)
        handleClose()
      }, 1200)
    } catch (error) {
      console.error("Error assigning driver:", error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveDriver = async () => {
    try {
      setIsRemoving(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      setSuccessMessage("Driver removed successfully")
      setTimeout(() => {
        onRemove?.()
        handleClose()
      }, 1200)
    } catch (error) {
      console.error("Error removing driver:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleClose = () => {
    setSearchTerm("")
    setSuccessMessage(null)
    onClose()
  }

  const activeDrivers = mockDrivers.filter((d) => d.role === "driver" && d.status === "active").length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-2xl ${
          isDark ? "border-amber-500/20 bg-slate-900" : "border-amber-200/50 bg-white"
        }`}
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            {currentDriver ? "Manage Driver Assignment" : "Assign Driver"}
          </DialogTitle>
          <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Vehicle Details
          </DialogDescription>
          <div className={`mt-2 space-y-2 ${isDark ? "text-slate-400" : "text-slate-600"} text-sm`}>
            <div>
              Vehicle: <span className="font-semibold text-slate-200">{vehicle.plateNumber}</span>
            </div>
            <div>
              Model: <span className="font-semibold text-slate-200">{vehicle.manufacturer} {vehicle.model}</span>
            </div>
          </div>
        </DialogHeader>

        <div className={`space-y-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-6`}>
          {/* Success Message */}
          {successMessage && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                isDark
                  ? "bg-emerald-500/15 border border-emerald-500/40"
                  : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <CheckCircle
                className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                {successMessage}
              </p>
            </div>
          )}

          {/* Current Driver Section */}
          {currentDriver && (
            <div className={`p-4 rounded-lg ${isDark ? "bg-amber-500/10 border border-amber-500/30" : "bg-amber-50/50 border border-amber-200/50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className={`h-5 w-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Currently Assigned
                    </p>
                    <p className={`text-lg font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                      {currentDriver}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveDriver}
                  disabled={isRemoving || isAssigning}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Available Drivers Section */}
          <div className="space-y-4">
            <div>
              <p className={`text-sm font-semibold mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <Users className="h-4 w-4 inline mr-2" />
                Available Drivers ({activeDrivers})
              </p>

              {/* Search Input */}
              <Input
                placeholder="Search by name, email, or license number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`mb-4 ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                    : "border-slate-200 bg-white"
                }`}
              />
            </div>

            {/* Drivers List */}
            <div
              className={`space-y-2 max-h-96 overflow-y-auto ${
                isDark ? "border border-slate-700 rounded-lg p-2" : "border border-slate-200 rounded-lg p-2"
              }`}
            >
              {filteredDrivers.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle
                    className={`h-8 w-8 mx-auto mb-2 opacity-50 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    No drivers found matching your search
                  </p>
                </div>
              ) : (
                filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    onClick={() => !isAssigning && !isRemoving && handleAssignDriver(driver)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isDark
                        ? "border-slate-700 bg-slate-800/50 hover:border-amber-500/40 hover:bg-slate-800/80 disabled:opacity-50"
                        : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50 disabled:opacity-50"
                    } ${isAssigning || isRemoving ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {driver.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 items-center">
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {driver.email}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              driver.status === "active"
                                ? isDark
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isDark
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {driver.status === "active" ? "Active" : "On Leave"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3">
                          <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                            License: {driver.licenseNumber}
                          </span>
                          <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                            Rating: ⭐ {driver.rating}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                        disabled={isAssigning || isRemoving || driver.status !== "active"}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isAssigning && !isRemoving) {
                            handleAssignDriver(driver)
                          }
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        Assign
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              💡 <span className="font-medium">Tip:</span> You can assign an active driver to this vehicle. Only drivers with "Active" status can be assigned.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
