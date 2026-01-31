import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FleetManagerServiceJobService } from "@/components/api/serviceJob.service"
import type { ServiceJob } from "@/types/serviceJob.types"
import { AlertCircle, Loader2, CheckCircle2, Clock, Wrench, Package } from "lucide-react"
import { toast } from "sonner"

interface ServiceJobDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string | null
  isDark: boolean
  onJobCompleted?: () => void
}

export function ServiceJobDetailDialog({
  open,
  onOpenChange,
  jobId,
  isDark,
  onJobCompleted,
}: ServiceJobDetailDialogProps) {
  const [job, setJob] = useState<ServiceJob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")
  const [actualCost, setActualCost] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    if (open && jobId) {
      fetchJobDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobId])

  const fetchJobDetails = async () => {
    if (!jobId) return

    try {
      setLoading(true)
      setError(null)
      const data = await FleetManagerServiceJobService.getServiceJobById(jobId)
      setJob(data)
    } catch (err) {
      console.error("Failed to load job details:", err)
      setError("Failed to load job details. Please try again.")
      toast.error("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteJob = async () => {
    if (!job?.id) return

    // Validation
    if (actualCost && parseFloat(actualCost) < 0) {
      toast.error("Actual cost cannot be negative")
      return
    }

    try {
      setIsCompleting(true)
      await FleetManagerServiceJobService.completeServiceJob(
        job.id,
        completionNotes || undefined,
        actualCost ? parseFloat(actualCost) : undefined
      )
      
      toast.success("Service job completed successfully")
      setCompletionDialogOpen(false)
      
      // Refresh job details
      await fetchJobDetails()
      
      // Notify parent component
      onJobCompleted?.()
    } catch (err) {
      console.error("Failed to complete job:", err)
      toast.error("Failed to complete service job. Please try again.")
    } finally {
      setIsCompleting(false)
    }
  }

  const resetCompletionForm = () => {
    setCompletionNotes("")
    setActualCost("")
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          color: isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          label: "Pending",
        }
      case "IN_PROGRESS":
        return {
          color: isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200",
          icon: Loader2,
          label: "In Progress",
        }
      case "COMPLETED":
        return {
          color: isDark ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
          label: "Completed",
        }
      case "CANCELLED":
        return {
          color: isDark ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200",
          icon: AlertCircle,
          label: "Cancelled",
        }
      default:
        return {
          color: isDark ? "bg-slate-500/10 text-slate-400 border-slate-500/30" : "bg-slate-50 text-slate-700 border-slate-200",
          icon: AlertCircle,
          label: "Unknown",
        }
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "LOW":
        return isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200"
      case "MEDIUM":
        return isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200"
      case "HIGH":
        return isDark ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "bg-orange-50 text-orange-700 border-orange-200"
      case "URGENT":
        return isDark ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"
      default:
        return isDark ? "bg-slate-500/10 text-slate-400 border-slate-500/30" : "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  if (!jobId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isDark ? "bg-slate-900 border-white/10" : "bg-white"} sm:max-w-2xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : "text-slate-900"}>
            Service Job Details
          </DialogTitle>
          <DialogDescription>
            {loading ? "Loading job details..." : `Job ID: ${jobId}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className={`rounded-lg border flex gap-2 p-3 ${isDark ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"}`}>
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {job && !loading && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className={`rounded-lg border p-4 ${isDark ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {job.jobNumber}
                  </h3>
                  <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                    {job.title}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusConfig(job.status).color}>
                    {getStatusConfig(job.status).label}
                  </Badge>
                  <Badge className={getPriorityConfig(job.priority)}>
                    {job.priority}
                  </Badge>
                </div>
              </div>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Created: {new Date(job.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Description & Instructions */}
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Description
                </h4>
                <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {job.description}
                </p>
              </div>

              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Instructions
                </h4>
                <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {job.instructions}
                </p>
              </div>
            </div>

            <Separator className={isDark ? "bg-white/10" : ""} />

            {/* Vehicle Information */}
            <div>
              <h4 className={`text-sm font-semibold mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Vehicle Information
              </h4>
              <div className={`grid grid-cols-2 gap-3 rounded-lg border p-3 ${isDark ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <div>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Plate Number
                  </p>
                  <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {job.vehiclePlateNumber}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Manufacturer
                  </p>
                  <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {job.vehicleManufacturer}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Model
                  </p>
                  <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {job.vehicleModel}
                  </p>
                </div>
                {job.vehicleYear && (
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Year
                    </p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {job.vehicleYear}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Information */}
            {job.errorCode && (
              <div>
                <h4 className={`text-sm font-semibold mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Error Information
                </h4>
                <div className={`grid grid-cols-2 gap-3 rounded-lg border p-3 ${isDark ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Error Code
                    </p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {job.errorCode}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Error Title
                    </p>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {job.errorTitle}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator className={isDark ? "bg-white/10" : ""} />

            {/* Scheduled Date & Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Scheduled Date
                </h4>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {new Date(job.scheduledDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Estimated Cost
                </h4>
                <p className={`text-sm font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                  ${job.estimatedCost.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Actual Cost (if job is completed) */}
            {job.actualCost !== null && (
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Actual Cost
                </h4>
                <p className={`text-sm font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  ${job.actualCost.toFixed(2)}
                </p>
              </div>
            )}

            <Separator className={isDark ? "bg-white/10" : ""} />

            {/* Assigned Mechanics */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4" />
                <h4 className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Assigned Mechanics ({job.totalMechanics})
                </h4>
              </div>
              {job.assignedMechanics.length > 0 ? (
                <div className="space-y-2">
                  {job.assignedMechanics.map((mechanic) => (
                    <Card
                      key={mechanic.assignmentId}
                      className={`p-3 ${isDark ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {mechanic.mechanicName || "Mechanic"}
                          </p>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {mechanic.mechanicEmail}
                          </p>
                          {mechanic.notes && (
                            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {mechanic.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              mechanic.accepted
                                ? isDark
                                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                                  : "bg-green-50 text-green-700 border-green-200"
                                : isDark
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {mechanic.accepted ? "Accepted" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      <p className={`text-xs mt-2 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                        Assigned: {new Date(mechanic.assignedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  No mechanics assigned yet
                </p>
              )}
            </div>

            {/* Required Parts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <h4 className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Required Parts ({job.totalParts})
                </h4>
              </div>
              {job.requiredParts.length > 0 ? (
                <div className="space-y-2">
                  {job.requiredParts.map((part) => (
                    <Card
                      key={part.id}
                      className={`p-3 ${isDark ? "bg-slate-800 border-white/10" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {part.partName}
                          </p>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {part.partNumber}
                          </p>
                        </div>
                        <Badge
                          className={
                            part.received
                              ? isDark
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : "bg-green-50 text-green-700 border-green-200"
                              : isDark
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {part.received ? "Received" : "On Order"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className={isDark ? "text-slate-500" : "text-slate-500"}>
                            Qty
                          </p>
                          <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {part.quantity}
                          </p>
                        </div>
                        <div>
                          <p className={isDark ? "text-slate-500" : "text-slate-500"}>
                            Unit Price
                          </p>
                          <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            ${part.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={isDark ? "text-slate-500" : "text-slate-500"}>
                            Total
                          </p>
                          <p className={`font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                            ${part.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  No parts required
                </p>
              )}
            </div>

            {/* Completion Notes */}
            {job.completionNotes && (
              <>
                <Separator className={isDark ? "bg-white/10" : ""} />
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Completion Notes
                  </h4>
                  <p className={`text-sm whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {job.completionNotes}
                  </p>
                </div>
              </>
            )}

            {/* Action Button */}
            <Separator className={isDark ? "bg-white/10" : ""} />
            <div className="pt-4">
              {job.status !== "COMPLETED" && job.status !== "CANCELLED" ? (
                <Button
                  onClick={() => {
                    setCompletionNotes("")
                    setActualCost("")
                    setCompletionDialogOpen(true)
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Service Job
                </Button>
              ) : (
                <div className={`p-3 rounded-lg text-center ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                  <p className="text-sm">This job is already {job.status === "COMPLETED" ? "completed" : "cancelled"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Completion Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className={`${isDark ? "bg-slate-900 border-white/10" : "bg-white"} sm:max-w-md`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-slate-900"}>
              Complete Service Job
            </DialogTitle>
            <DialogDescription>
              Finalize the service job and record completion details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Completion Notes */}
            <div>
              <label className={`text-sm font-medium block mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Completion Notes (Optional)
              </label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe the work completed, any issues found, etc."
                className={`h-24 ${isDark ? "bg-slate-800 border-slate-700 text-white" : ""}`}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Provide details about what was accomplished during this service job.
              </p>
            </div>

            {/* Actual Cost */}
            <div>
              <label className={`text-sm font-medium block mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Actual Cost (Optional)
              </label>
              <Input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`${isDark ? "bg-slate-800 border-slate-700 text-white" : ""}`}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Enter the actual cost for this service job. Estimated cost: ${job?.estimatedCost.toFixed(2)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCompletionDialogOpen(false)
                  resetCompletionForm()
                }}
                disabled={isCompleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteJob}
                disabled={isCompleting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCompleting ? "Completing..." : "Mark Complete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

