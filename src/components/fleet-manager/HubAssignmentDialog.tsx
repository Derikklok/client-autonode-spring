import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2, Search } from "lucide-react"
import { FleetManagerHubService } from "@/components/api/fleetManager.service"
import type { Hub } from "@/types/hub.types"
import type { Vehicle } from "@/types/vehicle.types"
import { toast } from "sonner"

interface HubAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onAssignSuccess?: () => void
}

export function HubAssignmentDialog({
  open,
  onOpenChange,
  vehicle,
  onAssignSuccess,
}: HubAssignmentDialogProps) {
  const [availableHubs, setAvailableHubs] = useState<Hub[]>([])
  const [filteredHubs, setFilteredHubs] = useState<Hub[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && vehicle) {
      fetchAvailableHubs()
    }
  }, [open, vehicle])

  useEffect(() => {
    const filtered = availableHubs.filter((hub) =>
      hub.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.modelName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredHubs(filtered)
  }, [searchTerm, availableHubs])

  const fetchAvailableHubs = async () => {
    try {
      setLoading(true)
      setError(null)
      const hubs = await FleetManagerHubService.getAvailableHubs()
      setAvailableHubs(hubs)
      setSelectedHub(null)
    } catch (err) {
      const error = err as Error & { response?: { status: number; data: { message: string } } }
      const message =
        error.response?.status === 404
          ? "No available hubs found"
          : error.response?.data?.message || "Failed to load available hubs"
      setError(message)
      console.error("Failed to fetch available hubs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignHub = async () => {
    if (!vehicle?.id || !selectedHub?.id) {
      toast.error("Please select a hub to assign")
      return
    }

    try {
      setIsAssigning(true)
      setError(null)
      
      await FleetManagerHubService.assignHubToVehicle(selectedHub.id, vehicle.id)
      
      toast.success(`Hub ${selectedHub.serialNumber} assigned to ${vehicle.plateNumber}`)
      onOpenChange(false)
      onAssignSuccess?.()
    } catch (err) {
      const error = err as Error & { response?: { status: number; data: { message: string } } }
      
      if (error.response?.status === 409) {
        setError("This hub is already assigned to another vehicle")
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || "Invalid hub or vehicle selection")
      } else {
        setError("Failed to assign hub. Please try again.")
      }
      
      console.error("Failed to assign hub:", err)
    } finally {
      setIsAssigning(false)
    }
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Hub to Vehicle</DialogTitle>
          <DialogDescription>
            Select an available OBD diagnostic hub to assign to {vehicle.plateNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Info */}
          <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3 space-y-2">
            <div className="text-sm">
              <p className="text-slate-600 dark:text-slate-400">Vehicle</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {vehicle.manufacturer} {vehicle.model} - {vehicle.plateNumber}
              </p>
            </div>
            {vehicle.driverEmail && (
              <div className="text-sm">
                <p className="text-slate-600 dark:text-slate-400">Driver</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {vehicle.driverEmail}
                </p>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Search Input */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Search Available Hubs
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by serial number, manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="pl-10"
              />
            </div>
          </div>

          {/* Hubs List */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Select Hub
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : filteredHubs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {availableHubs.length === 0
                    ? "No available hubs found"
                    : "No hubs match your search"}
                </p>
              </div>
            ) : (
              <Select
                value={selectedHub?.id || ""}
                onValueChange={(hubId) => {
                  const hub = availableHubs.find((h) => h.id === hubId)
                  setSelectedHub(hub || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a hub..." />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {filteredHubs.map((hub) => (
                    <SelectItem key={hub.id} value={hub.id}>
                      <div className="flex items-center gap-2">
                        <span>{hub.serialNumber}</span>
                        <span className="text-xs text-slate-500">
                          {hub.manufacturer} {hub.modelName}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Hub Details */}
          {selectedHub && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                  Hub Selected
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-emerald-800 dark:text-emerald-200">
                  <span className="font-medium">Serial:</span> {selectedHub.serialNumber}
                </p>
                <p className="text-emerald-800 dark:text-emerald-200">
                  <span className="font-medium">Device:</span> {selectedHub.manufacturer} {selectedHub.modelName}
                </p>
                <p className="text-emerald-800 dark:text-emerald-200">
                  <span className="font-medium">Supplier:</span> {selectedHub.supplierName}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAssigning}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignHub}
              disabled={!selectedHub || isAssigning}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAssigning ? "Assigning..." : "Assign Hub"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
