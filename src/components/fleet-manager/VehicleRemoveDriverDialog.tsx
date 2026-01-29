import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react"
import { FleetManagerDriverService } from "@/components/api/fleetManager.service"

interface VehicleRemoveDriverDialogProps {
  vehicle: { id: string; plateNumber: string; manufacturer: string; model: string }
  isDark: boolean
  isOpen: boolean
  currentDriverEmail: string | null
  onClose: () => void
  onRemove?: () => void
}

export function VehicleRemoveDriverDialog({
  vehicle,
  isDark,
  isOpen,
  currentDriverEmail,
  onClose,
  onRemove,
}: VehicleRemoveDriverDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    setSuccessMessage(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`max-w-md ${
          isDark ? "border-red-500/20 bg-slate-900" : "border-red-200/50 bg-white"
        }`}
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
            Remove Driver
          </DialogTitle>
          <DialogDescription className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Confirm driver removal
          </DialogDescription>
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

          {/* Vehicle and Driver Info */}
          {!successMessage && (
            <>
              <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <p className={`text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Vehicle
                </p>
                <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {vehicle.plateNumber}
                </p>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {vehicle.manufacturer} {vehicle.model}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50/50 border border-red-200/50"}`}>
                <p className={`text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Assigned Driver
                </p>
                <p className={`font-semibold ${isDark ? "text-red-400" : "text-red-700"}`}>
                  {currentDriverEmail}
                </p>
              </div>

              {/* Warning Message */}
              <div
                className={`p-4 rounded-lg flex gap-3 ${
                  isDark
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-amber-50/50 border border-amber-200/50"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 shrink-0 mt-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`}
                />
                <p className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  This will unassign the driver from the vehicle. The driver will become available for assignment to other vehicles.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isRemoving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveDriver}
                  disabled={isRemoving}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isRemoving ? "Removing..." : "Remove Driver"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
