import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { FleetManagerHubService } from "@/components/api/fleetManager.service"
import type { Hub } from "@/types/hub.types"
import { toast } from "sonner"

interface HubRemovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hub: Hub | null
  vehiclePlateNumber?: string | null
  onRemoveSuccess?: () => void
}

export function HubRemovalDialog({
  open,
  onOpenChange,
  hub,
  vehiclePlateNumber,
  onRemoveSuccess,
}: HubRemovalDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRemoveHub = async () => {
    if (!hub?.id) return

    try {
      setIsRemoving(true)
      setError(null)

      await FleetManagerHubService.unassignHubFromVehicle(hub.id)

      toast.success(`Hub ${hub.serialNumber} removed from vehicle`)
      onOpenChange(false)
      onRemoveSuccess?.()
    } catch (err) {
      const error = err as Error & { response?: { status: number; data: { message: string } } }

      if (error.response?.status === 404) {
        setError("Hub or assignment not found")
      } else if (error.response?.status === 400) {
        setError(error.response.data?.message || "Cannot remove this hub")
      } else {
        setError("Failed to remove hub. Please try again.")
      }

      console.error("Failed to remove hub:", err)
    } finally {
      setIsRemoving(false)
    }
  }

  if (!hub) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            Remove Hub
          </DialogTitle>
          <DialogDescription>
            Unassign this OBD diagnostic hub from the vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hub Info */}
          <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3 space-y-2">
            <div className="text-sm">
              <p className="text-slate-600 dark:text-slate-400">Hub Serial Number</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {hub.serialNumber}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-slate-600 dark:text-slate-400">Device</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {hub.manufacturer} {hub.modelName}
              </p>
            </div>
            {vehiclePlateNumber && (
              <div className="text-sm">
                <p className="text-slate-600 dark:text-slate-400">Currently Assigned to</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {vehiclePlateNumber}
                </p>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3">
            <p className="text-sm text-amber-900 dark:text-amber-300">
              ⚠️ This hub will become available for assignment to other vehicles after removal.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isRemoving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveHub}
              disabled={isRemoving}
              variant="destructive"
              className="flex-1 gap-2"
            >
              {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRemoving ? "Removing..." : "Remove Hub"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
