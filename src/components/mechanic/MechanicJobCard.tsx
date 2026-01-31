import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, AlertCircle, Loader2 } from "lucide-react"
import { JobStatusBadge } from "./JobStatusBadge"
import { JobPriorityBadge } from "./JobPriorityBadge"
import { MechanicService } from "@/components/api/mechanic.service"
import type { MechanicJob } from "@/types/mechanic.types"
import { toast } from "sonner"

interface MechanicJobCardProps {
  job: MechanicJob
  isDark: boolean
  onAcceptSuccess?: (job: MechanicJob) => void
  onDeclineSuccess?: (job: MechanicJob) => void
  onStartSuccess?: (job: MechanicJob) => void
  onViewDetails?: (job: MechanicJob) => void
  showAcceptButton?: boolean
  showDeclineButton?: boolean
  showStartButton?: boolean
  isPending?: boolean
}

export function MechanicJobCard({
  job,
  isDark,
  onAcceptSuccess,
  onDeclineSuccess,
  onStartSuccess,
  onViewDetails,
  showAcceptButton = true,
  showDeclineButton = true,
  showStartButton = true,
  isPending = false,
}: MechanicJobCardProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showDeclineNotes, setShowDeclineNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const [declineNotes, setDeclineNotes] = useState("")

  const handleAccept = async () => {
    try {
      setIsAccepting(true)
      const updatedJob = await MechanicService.acceptJob(job.id, notes)
      toast.success("Job accepted successfully")
      onAcceptSuccess?.(updatedJob)
      setNotes("")
      setShowNotes(false)
    } catch (err) {
      console.error("Failed to accept job:", err)
      toast.error("Failed to accept job")
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    try {
      setIsDeclining(true)
      const updatedJob = await MechanicService.declineJob(job.id, declineNotes)
      toast.success("Job declined successfully")
      onDeclineSuccess?.(updatedJob)
      setDeclineNotes("")
      setShowDeclineNotes(false)
    } catch (err) {
      console.error("Failed to decline job:", err)
      toast.error("Failed to decline job")
    } finally {
      setIsDeclining(false)
    }
  }

  const handleStart = async () => {
    try {
      setIsStarting(true)
      const updatedJob = await MechanicService.startJob(job.id)
      toast.success("Job started successfully")
      onStartSuccess?.(updatedJob)
    } catch (err) {
      console.error("Failed to start job:", err)
      toast.error("Failed to start job")
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white hover:bg-slate-50"
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                {job.title}
              </CardTitle>
              <JobPriorityBadge priority={job.priority} />
              <JobStatusBadge status={job.status} />
            </div>
            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <span className="font-medium">{job.jobNumber}</span>
              <span className="mx-2">•</span>
              <span>{job.vehiclePlateNumber}</span>
              <span className="mx-2">•</span>
              <span>
                {job.vehicleManufacturer} {job.vehicleModel}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              {job.estimatedCost.toFixed(2)}
            </div>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>Estimated</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Code Badge */}
        {job.errorCode && (
          <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {job.errorCode}
            </span>
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>
              {job.errorTitle}
            </span>
          </div>
        )}

        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{job.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>Scheduled</p>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {new Date(job.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          <div>
            <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>Mechanics</p>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {job.totalMechanicsAssigned}
            </p>
          </div>
          <div>
            <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>Parts</p>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {job.totalPartsRequired}
            </p>
          </div>
          <div>
            <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-600"}`}>Assigned</p>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {new Date(job.assignedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Acceptance Status */}
        {isPending && !job.accepted && (
          <div className={`p-3 rounded-lg border-l-4 border-l-blue-500 ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
            <p className={`text-sm font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>
              ⚠️ Awaiting your acceptance
            </p>
          </div>
        )}

        {isPending && job.accepted && !showNotes && (
          <div className={`p-3 rounded-lg border-l-4 border-l-green-500 ${isDark ? "bg-green-900/20" : "bg-green-50"}`}>
            <p className={`text-sm font-medium ${isDark ? "text-green-300" : "text-green-700"}`}>
              ✓ Job accepted on {new Date(job.acceptedAt!).toLocaleDateString()}
            </p>
            {job.mechanicNotes && (
              <p className={`text-xs mt-1 ${isDark ? "text-green-400" : "text-green-600"}`}>
                Notes: {job.mechanicNotes}
              </p>
            )}
          </div>
        )}

        {/* Notes Input */}
        {showNotes && (
          <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <label className={`text-xs font-medium block mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Add notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes about accepting this job..."
              className={`w-full p-2 text-sm rounded border ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={2}
            />
          </div>
        )}

        {/* Decline Notes Input */}
        {showDeclineNotes && (
          <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <label className={`text-xs font-medium block mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Reason for declining (optional)
            </label>
            <textarea
              value={declineNotes}
              onChange={(e) => setDeclineNotes(e.target.value)}
              placeholder="Let us know why you're declining this assignment..."
              className={`w-full p-2 text-sm rounded border ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
              rows={2}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap pt-2">
          {showAcceptButton && job.status === "PENDING" && !job.accepted && (
            <>
              {!showNotes && !showDeclineNotes ? (
                <>
                  <Button
                    onClick={() => setShowNotes(true)}
                    className="bg-primary hover:bg-accent"
                    size="sm"
                  >
                    Accept Job
                  </Button>
                  {showDeclineButton && (
                    <Button
                      onClick={() => setShowDeclineNotes(true)}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                      size="sm"
                    >
                      Decline
                    </Button>
                  )}
                </>
              ) : showNotes ? (
                <>
                  <Button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="bg-primary hover:bg-accent flex-1"
                    size="sm"
                  >
                    {isAccepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNotes(false)
                      setNotes("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleDecline}
                    disabled={isDeclining}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                    size="sm"
                  >
                    {isDeclining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirm Decline
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeclineNotes(false)
                      setDeclineNotes("")
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}

          {showStartButton && job.accepted && job.status === "PENDING" && (
            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="bg-primary hover:bg-accent"
              size="sm"
            >
              {isStarting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start Job
            </Button>
          )}

          <Button onClick={() => onViewDetails?.(job)} variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
