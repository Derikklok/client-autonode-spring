import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vehicle } from "@/types/vehicle.types"
import type { UpdateVehicleRequest, VehicleStatus } from "@/types/vehicle.types"
import { FleetManagerService } from "@/components/api/fleetManager.service"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface VehicleEditFormProps {
  vehicle: Vehicle
  isDark: boolean
  onSave?: (updatedVehicle: Vehicle) => void
  onCancel?: () => void
}

export function VehicleEditForm({ vehicle, isDark, onSave, onCancel }: VehicleEditFormProps) {
  const [formData, setFormData] = useState<UpdateVehicleRequest>({
    plateNumber: vehicle.plateNumber,
    manufacturer: vehicle.manufacturer,
    model: vehicle.model,
    status: vehicle.status as VehicleStatus,
    currentMileage: vehicle.currentMileage,
    serviceMileage: vehicle.serviceMileage,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof UpdateVehicleRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" && (field === "currentMileage" || field === "serviceMileage")
        ? parseInt(value, 10)
        : value,
    }))
    setError(null)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      // Validate required fields
      if (!formData.plateNumber.trim()) {
        setError("License plate is required")
        return
      }
      if (!formData.manufacturer.trim()) {
        setError("Manufacturer is required")
        return
      }
      if (!formData.model.trim()) {
        setError("Model is required")
        return
      }
      if (formData.currentMileage < 0 || formData.serviceMileage < 0) {
        setError("Mileage cannot be negative")
        return
      }

      // Call update service
      const updatedVehicle = await FleetManagerService.updateVehicle(vehicle.id, formData)

      setSuccess(true)
      setTimeout(() => {
        onSave?.(updatedVehicle)
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update vehicle. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Title */}
      <div>
        <h2 className={`text-xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
          Edit Vehicle Details
        </h2>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Update the vehicle information below
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${isDark ? "bg-red-500/15 border border-red-500/40" : "bg-red-50 border border-red-200"}`}>
          <AlertCircle className={`h-5 w-5 ${isDark ? "text-red-400" : "text-red-600"}`} />
          <p className={`text-sm font-medium ${isDark ? "text-red-400" : "text-red-700"}`}>{error}</p>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${isDark ? "bg-emerald-500/15 border border-emerald-500/40" : "bg-emerald-50 border border-emerald-200"}`}>
          <CheckCircle className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          <p className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
            Vehicle updated successfully!
          </p>
        </div>
      )}

      {/* Form Grid */}
      <div className={`space-y-6 p-5 rounded-xl ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-amber-50/50 border border-amber-100"}`}>
        {/* Row 1: Plate and Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              License Plate *
            </label>
            <Input
              value={formData.plateNumber}
              onChange={(e) => handleInputChange("plateNumber", e.target.value)}
              placeholder="e.g., TX-4521"
              disabled={isSubmitting || success}
              className={`${isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-amber-200"}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              Status *
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value as VehicleStatus)}
              disabled={isSubmitting || success}
            >
              <SelectTrigger className={`${isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-amber-200"}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDark ? "bg-slate-700 border-slate-600" : "bg-white"}>
                <SelectItem value="ACTIVE">
                  <span className="flex items-center gap-2">
                    🟢 Active
                  </span>
                </SelectItem>
                <SelectItem value="IN_SERVICE">
                  <span className="flex items-center gap-2">
                    🟡 In Service
                  </span>
                </SelectItem>
                <SelectItem value="INACTIVE">
                  <span className="flex items-center gap-2">
                    ⚪ Inactive
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Manufacturer and Model */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              Manufacturer *
            </label>
            <Input
              value={formData.manufacturer}
              onChange={(e) => handleInputChange("manufacturer", e.target.value)}
              placeholder="e.g., Volvo"
              disabled={isSubmitting || success}
              className={`${isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-amber-200"}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              Model *
            </label>
            <Input
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              placeholder="e.g., FH16"
              disabled={isSubmitting || success}
              className={`${isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-amber-200"}`}
            />
          </div>
        </div>

        {/* Row 3: Mileage */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Current Mileage (km) *
            </label>
            <Input
              type="number"
              value={formData.currentMileage}
              onChange={(e) => handleInputChange("currentMileage", e.target.value)}
              placeholder="0"
              disabled={isSubmitting || success}
              className={`${isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-blue-200"}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              Service Mileage (km) *
            </label>
            <Input
              type="number"
              value={formData.serviceMileage}
              onChange={(e) => handleInputChange("serviceMileage", e.target.value)}
              placeholder="0"
              disabled={isSubmitting || success}
              className={`${isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-emerald-200"}`}
            />
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/30 border border-slate-700" : "bg-blue-50/50 border border-blue-100"}`}>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          ℹ️ <span className="font-semibold">Note:</span> To change the vehicle image, use the separate image upload option. All fields marked with * are required.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || success}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Updated!
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || success}
          className={`flex-1 ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"} font-semibold`}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
