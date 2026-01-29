import { useState, useEffect } from "react"
import { toast } from "sonner"
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
import { FleetManagerDriverService } from "@/components/api/fleetManager.service"
import type { AvailableDriver } from "@/types/vehicle.types"

interface VehicleDriverAssignmentDialogProps {
  vehicle: { id: string; plateNumber: string; manufacturer: string; model: string }
  isDark: boolean
  isOpen: boolean
  currentDriver: string | null
  onClose: () => void
  onAssign?: (driverId: number, driverEmail: string) => void
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
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Validate vehicle ID on dialog open
      if (!vehicle.id) {
        console.error("Dialog opened without vehicle ID:", vehicle)
        toast.error("Invalid vehicle data. Please try again.")
        onClose()
        return
      }
      fetchAvailableDrivers()
    }
  }, [isOpen, vehicle, onClose])

  const fetchAvailableDrivers = async () => {
    try {
      setIsLoadingDrivers(true)
      setLoadError(null)
      const drivers = await FleetManagerDriverService.getAvailableDrivers()
      setAvailableDrivers(drivers)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load available drivers"
      setLoadError(message)
      toast.error(message)
    } finally {
      setIsLoadingDrivers(false)
    }
  }

  const filteredDrivers = availableDrivers.filter((driver) => {
    const searchLower = searchTerm.toLowerCase()
    const driverName = driver.fullName?.toLowerCase() || ""
    const driverEmail = driver.email.toLowerCase()
    
    return (
      driver.available &&
      (driverName.includes(searchLower) || driverEmail.includes(searchLower))
    )
  })

  const handleAssignDriver = async (driver: AvailableDriver) => {
    try {
      // Validate vehicle ID exists
      if (!vehicle.id) {
        const errorMsg = "Vehicle ID is missing. Please refresh and try again."
        toast.error(errorMsg)
        console.error(errorMsg, vehicle)
        return
      }

      setIsAssigning(true)
      // Call the actual API to assign driver to vehicle
      await FleetManagerDriverService.assignDriverToVehicle(vehicle.id, driver.id)
      
      const driverEmail = driver.email
      setSuccessMessage(`${driver.fullName || driverEmail} assigned successfully`)
      setTimeout(() => {
        onAssign?.(driver.id, driverEmail)
        handleClose()
      }, 1200)
    } catch (error) {
      let message = "Error assigning driver"
      
      // Handle specific error responses
      if (error instanceof Error) {
        const errorData = error as Error & { response?: { status: number; data: { message?: string } } }
        
        if (errorData.response?.status === 409) {
          message = errorData.response?.data?.message || "Driver is already assigned to another vehicle"
        } else {
          message = error.message
        }
      }
      
      console.error("Assignment error:", error)
      toast.error(message)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveDriver = async () => {
    try {
      setIsRemoving(true)
      // Call the actual API to remove driver from vehicle
      await FleetManagerDriverService.removeDriverFromVehicle(vehicle.id)
      
      setSuccessMessage("Driver removed successfully")
      setTimeout(() => {
        onRemove?.()
        handleClose()
      }, 1200)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error removing driver"
      toast.error(message)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleClose = () => {
    setSearchTerm("")
    setSuccessMessage(null)
    onClose()
  }

  const availableCount = availableDrivers.filter((d) => d.available).length

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
                Available Drivers ({availableCount})
              </p>

              {/* Search Input */}
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoadingDrivers}
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
              {isLoadingDrivers ? (
                <div className="p-8 text-center">
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Loading available drivers...
                  </p>
                </div>
              ) : loadError ? (
                <div className="p-8 text-center">
                  <AlertCircle
                    className={`h-8 w-8 mx-auto mb-2 ${
                      isDark ? "text-red-500" : "text-red-400"
                    }`}
                  />
                  <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                    {loadError}
                  </p>
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle
                    className={`h-8 w-8 mx-auto mb-2 opacity-50 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {searchTerm ? "No drivers found matching your search" : "No available drivers at the moment"}
                  </p>
                </div>
              ) : (
                filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isDark
                        ? "border-slate-700 bg-slate-800/50 hover:border-amber-500/40 hover:bg-slate-800/80 disabled:opacity-50"
                        : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50 disabled:opacity-50"
                    } ${isAssigning || isRemoving ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          {driver.fullName || "Unnamed Driver"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2 items-center">
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {driver.email}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              driver.available
                                ? isDark
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isDark
                                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {driver.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                        disabled={isAssigning || isRemoving || !driver.available}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isAssigning && !isRemoving && driver.available) {
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
              💡 <span className="font-medium">Tip:</span> You can assign an available driver to this vehicle. Only drivers with "Available" status can be assigned.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
