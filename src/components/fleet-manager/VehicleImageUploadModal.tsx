import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, Loader2, Upload, X } from "lucide-react"
import { FleetManagerService } from "@/components/api/fleetManager.service"
import type { Vehicle } from "@/types/vehicle.types"

interface VehicleImageUploadModalProps {
  vehicle: Vehicle
  isDark: boolean
  isOpen: boolean
  onClose: () => void
  onSuccess?: (updatedVehicle: Vehicle) => void
}

export function VehicleImageUploadModal({
  vehicle,
  isDark,
  isOpen,
  onClose,
  onSuccess,
}: VehicleImageUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first")
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setSuccess(false)

      const updatedVehicle = await FleetManagerService.updateVehicleImage(
        vehicle.id,
        selectedFile
      )

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.(updatedVehicle)
        handleClose()
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload image. Please try again."
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
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
      <DialogContent className={`max-w-xl ${isDark ? "border-amber-500/30 bg-slate-900" : "border-amber-200 bg-white"}`}>
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className={`text-2xl font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                Update Vehicle Image
              </DialogTitle>
              <DialogDescription className={`mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Upload a new image for {vehicle.plateNumber}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isUploading}
              className={isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-600 hover:bg-slate-100"}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
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
                Image uploaded successfully!
              </p>
            </div>
          )}

          {/* File Input Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDark
                ? "border-amber-500/30 bg-slate-800/50 hover:bg-slate-800/80 hover:border-amber-500/50"
                : "border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 hover:border-amber-300"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
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

          {/* Current Image Info */}
          {vehicle.imageUrl && (
            <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                Current Image
              </p>
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/30 border border-slate-700" : "bg-blue-50/50 border border-blue-100"}`}>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              ℹ️ <span className="font-semibold">Supported formats:</span> JPG, PNG, WebP, GIF • <span className="font-semibold">Max size:</span> 5MB
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || success}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Uploaded!
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
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
