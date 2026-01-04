import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react"
import { FleetManagerService } from "@/components/api/fleetManager.service"
import type { Vehicle, CreateVehicleRequest } from "@/types/vehicle.types"

interface VehicleCreateFormProps {
  isDark: boolean
  isOpen: boolean
  onClose: () => void
  onSuccess?: (newVehicle: Vehicle) => void
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "IN_SERVICE", label: "In Service" },
  { value: "INACTIVE", label: "Inactive" },
]

const COLOR_OPTIONS = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "silver", label: "Silver" },
  { value: "gray", label: "Gray" },
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "orange", label: "Orange" },
  { value: "brown", label: "Brown" },
]

export function VehicleCreateForm({ isDark, isOpen, onClose, onSuccess }: VehicleCreateFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    plateNumber: "",
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    currentMileage: 0,
    serviceMileage: 0,
    status: "ACTIVE" as const,
    color: "white",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, etc.)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
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
      if (!selectedFile) {
        setError("Please select a vehicle image")
        return
      }
      if (formData.currentMileage < 0 || formData.serviceMileage < 0) {
        setError("Mileage cannot be negative")
        return
      }
      if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        setError("Please enter a valid year")
        return
      }

      // Create the request payload
      const createRequest: CreateVehicleRequest = {
        plateNumber: formData.plateNumber.trim().toUpperCase(),
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        year: formData.year,
        currentMileage: formData.currentMileage,
        serviceMileage: formData.serviceMileage,
        status: formData.status,
        color: formData.color,
        image: selectedFile,
      }

      // Call create service
      const newVehicle = await FleetManagerService.createVehicle(createRequest)

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.(newVehicle)
        handleClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vehicle. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      plateNumber: "",
      manufacturer: "",
      model: "",
      year: new Date().getFullYear(),
      currentMileage: 0,
      serviceMileage: 0,
      status: "ACTIVE",
      color: "white",
    })
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isDark ? "border-amber-500/30 bg-slate-900" : "border-amber-200 bg-white"}`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            Add New Vehicle
          </DialogTitle>
          <DialogDescription className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Fill in the details below to register a new vehicle to your fleet
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"} pt-6`}>
          {/* Error State */}
          {error && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${isDark ? "bg-red-500/15 border border-red-500/40" : "bg-red-50 border border-red-200"}`}>
              <AlertCircle className={`h-5 w-5 shrink-0 ${isDark ? "text-red-400" : "text-red-600"}`} />
              <p className={`text-sm font-medium ${isDark ? "text-red-400" : "text-red-700"}`}>{error}</p>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${isDark ? "bg-emerald-500/15 border border-emerald-500/40" : "bg-emerald-50 border border-emerald-200"}`}>
              <CheckCircle className={`h-5 w-5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <p className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                Vehicle created successfully!
              </p>
            </div>
          )}

          {/* Vehicle Image Upload Area */}
          <div>
            <Label className={`block text-sm font-semibold uppercase tracking-wide mb-3 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              Vehicle Image *
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                isDark
                  ? "border-amber-500/30 bg-slate-800/50 hover:bg-slate-800/80 hover:border-amber-500/50"
                  : "border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 hover:border-amber-300"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isSubmitting}
                className="hidden"
              />

              {preview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-lg shadow-lg"
                    />
                    <div className={`absolute inset-0 rounded-lg ${isDark ? "bg-black/20" : "bg-white/20"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {selectedFile?.name}
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {(selectedFile?.size ?? 0) / 1024 / 1024 < 1
                        ? `${((selectedFile?.size ?? 0) / 1024).toFixed(2)} KB`
                        : `${((selectedFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB`}
                    </p>
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`flex justify-center ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    <Upload className="h-12 w-12" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      Drag and drop your image here
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      or click to browse (JPG, PNG, WebP - max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Sections */}
          <div className={`space-y-6 p-5 rounded-xl ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-amber-50/50 border border-amber-100"}`}>
            {/* Basic Information */}
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                Basic Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    License Plate *
                  </Label>
                  <Input
                    value={formData.plateNumber}
                    onChange={(e) => handleInputChange("plateNumber", e.target.value.toUpperCase())}
                    placeholder="e.g., TX-4521"
                    disabled={isSubmitting}
                    className={isDark ? "border-amber-500/30 bg-slate-700 text-slate-100" : "border-amber-200"}
                  />
                </div>
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={isDark ? "border-amber-500/30 bg-slate-700" : "border-amber-200"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Manufacturer & Model */}
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Vehicle Details
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Manufacturer *
                  </Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    placeholder="e.g., Volkswagen"
                    disabled={isSubmitting}
                    className={isDark ? "border-blue-500/30 bg-slate-700 text-slate-100" : "border-blue-200"}
                  />
                </div>
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Model *
                  </Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="e.g., Actros"
                    disabled={isSubmitting}
                    className={isDark ? "border-blue-500/30 bg-slate-700 text-slate-100" : "border-blue-200"}
                  />
                </div>
              </div>
            </div>

            {/* Year & Color */}
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                Year & Color
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Year *
                  </Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", parseInt(e.target.value) || new Date().getFullYear())}
                    disabled={isSubmitting}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={isDark ? "border-purple-500/30 bg-slate-700 text-slate-100" : "border-purple-200"}
                  />
                </div>
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Color
                  </Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => handleInputChange("color", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={isDark ? "border-purple-500/30 bg-slate-700" : "border-purple-200"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-slate-300"
                              style={{
                                backgroundColor: option.value,
                              }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mileage */}
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                Mileage Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Current Mileage (km) *
                  </Label>
                  <Input
                    type="number"
                    value={formData.currentMileage}
                    onChange={(e) => handleInputChange("currentMileage", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isSubmitting}
                    min="0"
                    className={isDark ? "border-emerald-500/30 bg-slate-700 text-slate-100" : "border-emerald-200"}
                  />
                </div>
                <div>
                  <Label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Service Mileage (km) *
                  </Label>
                  <Input
                    type="number"
                    value={formData.serviceMileage}
                    onChange={(e) => handleInputChange("serviceMileage", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isSubmitting}
                    min="0"
                    className={isDark ? "border-emerald-500/30 bg-slate-700 text-slate-100" : "border-emerald-200"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/30 border border-slate-700" : "bg-blue-50/50 border border-blue-100"}`}>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              ℹ️ <span className="font-semibold">All fields marked with * are required.</span> You can edit additional details after vehicle creation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isSubmitting || success}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Created!
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Vehicle
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className={`flex-1 ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-300" : "border-slate-300 hover:bg-slate-100 text-slate-700"} font-semibold`}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
