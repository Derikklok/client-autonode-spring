import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { FleetManagerHubService } from "@/components/api/fleetManager.service"
import { toast } from "sonner"

interface HubCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSuccess?: () => void
}

interface FormData {
  serialNumber: string
  manufacturer: string
  modelName: string
  supplierName: string
  apiKey: string
}

export function HubCreationDialog({
  open,
  onOpenChange,
  onCreateSuccess,
}: HubCreationDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    serialNumber: "",
    manufacturer: "",
    modelName: "",
    supplierName: "",
    apiKey: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateHub = async () => {
    // Validate form
    if (
      !formData.serialNumber.trim() ||
      !formData.manufacturer.trim() ||
      !formData.modelName.trim() ||
      !formData.supplierName.trim() ||
      !formData.apiKey.trim()
    ) {
      setError("All fields are required")
      return
    }

    try {
      setIsCreating(true)
      setError(null)

      await FleetManagerHubService.createHub({
        serialNumber: formData.serialNumber,
        manufacturer: formData.manufacturer,
        modelName: formData.modelName,
        supplierName: formData.supplierName,
      })

      toast.success(`Hub ${formData.serialNumber} created successfully`)
      setFormData({
        serialNumber: "",
        manufacturer: "",
        modelName: "",
        supplierName: "",
        apiKey: "",
      })
      onOpenChange(false)
      onCreateSuccess?.()
    } catch (err) {
      const error = err as Error & { response?: { status: number; data: { message: string } } }

      if (error.response?.status === 409) {
        setError(
          "Hub with this serial number already exists. Please use a unique serial number."
        )
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || "Invalid hub data provided")
      } else {
        setError("Failed to create hub. Please try again.")
      }

      console.error("Failed to create hub:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        serialNumber: "",
        manufacturer: "",
        modelName: "",
        supplierName: "",
        apiKey: "",
      })
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Hub</DialogTitle>
          <DialogDescription>
            Add a new OBD diagnostic hub to your fleet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Serial Number Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Serial Number *
            </label>
            <Input
              name="serialNumber"
              placeholder="e.g., DR4189-Y6500"
              value={formData.serialNumber}
              onChange={handleInputChange}
              disabled={isCreating}
              className="text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Must be unique. Example: DR4189-Y6500
            </p>
          </div>

          {/* Manufacturer Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Manufacturer *
            </label>
            <Input
              name="manufacturer"
              placeholder="e.g., Nissan"
              value={formData.manufacturer}
              onChange={handleInputChange}
              disabled={isCreating}
              className="text-sm"
            />
          </div>

          {/* Model Name Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Model Name *
            </label>
            <Input
              name="modelName"
              placeholder="e.g., OBD-457"
              value={formData.modelName}
              onChange={handleInputChange}
              disabled={isCreating}
              className="text-sm"
            />
          </div>

          {/* Supplier Name Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Supplier Name *
            </label>
            <Input
              name="supplierName"
              placeholder="e.g., Gregory Auto Parts (Pvt) Ltd"
              value={formData.supplierName}
              onChange={handleInputChange}
              disabled={isCreating}
              className="text-sm"
            />
          </div>

          {/* API Key Field */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              API Key *
            </label>
            <Input
              name="apiKey"
              placeholder="e.g., setyuityu1"
              value={formData.apiKey}
              onChange={handleInputChange}
              disabled={isCreating}
              type="password"
              className="text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Must be unique. This key is used for hub authentication.
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-3">
            <p className="text-xs text-blue-900 dark:text-blue-300">
              ℹ️ All fields are required. Serial Number and API Key must be unique within your system. Department will be assigned automatically based on your account.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateHub}
              disabled={isCreating}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Hub"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
