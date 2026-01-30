import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Trash2, Plus, CheckCircle, Wrench, Users, Package, ArrowRight, Flag, Calendar, DollarSign } from "lucide-react"
import { FleetManagerServiceJobService } from "@/components/api/serviceJob.service"
import type { MonitoringError } from "@/types/monitoring.types"
import type { CreateServiceJobRequest, ServiceJobPriority } from "@/types/serviceJob.types"
import type { AdminUser } from "@/types/admin.types"
import { toast } from "sonner"

interface ServiceJobCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  error: MonitoringError | null
  isDark: boolean
  onCreateSuccess?: () => void
}

interface ErrorMessage {
  message: string
}

interface PartFormData {
  partName: string
  partNumber: string
  manufacturer: string
  quantity: number
  unitPrice: number
  description: string
  supplier: string
}

export function ServiceJobCreationDialog({
  open,
  onOpenChange,
  error,
  isDark,
  onCreateSuccess,
}: ServiceJobCreationDialogProps) {
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [instructions, setInstructions] = useState("")
  const [priority, setPriority] = useState<ServiceJobPriority>("MEDIUM")
  const [scheduledDate, setScheduledDate] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [selectedMechanics, setSelectedMechanics] = useState<number[]>([])
  const [parts, setParts] = useState<PartFormData[]>([])
  const [currentPart, setCurrentPart] = useState<PartFormData>({
    partName: "",
    partNumber: "",
    manufacturer: "",
    quantity: 1,
    unitPrice: 0,
    description: "",
    supplier: "",
  })

  // UI State
  const [mechanics, setMechanics] = useState<AdminUser[]>([])
  const [loadingMechanics, setLoadingMechanics] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"basic" | "mechanics" | "parts">("basic")

  // Load mechanics on dialog open
  useEffect(() => {
    if (open && error) {
      loadMechanics()
      // Pre-populate fields from error
      setTitle(`Fix: ${error.title}`)
      setDescription(`Error Code: ${error.errorCode}\nSubsystem: ${error.subsystem}\n\nDetected: ${error.description}`)
      setInstructions(`1. Diagnose issue in ${error.subsystem}\n2. Perform necessary repairs\n3. Test vehicle operation\n4. Document completion`)
      setPriority(error.severity === "CRITICAL" ? "URGENT" : error.severity === "MODERATE" ? "HIGH" : "MEDIUM")
    }
  }, [open, error])

  const loadMechanics = async () => {
    try {
      setLoadingMechanics(true)
      const data = await FleetManagerServiceJobService.getAvailableMechanics()
      setMechanics(data)
    } catch (err) {
      console.error("Failed to load mechanics:", err)
      setErrorMessage("Failed to load mechanics list")
    } finally {
      setLoadingMechanics(false)
    }
  }

  const handleAddPart = () => {
    if (!currentPart.partName || !currentPart.partNumber) {
      toast.error("Please fill in part name and number")
      return
    }
    setParts([...parts, currentPart])
    setCurrentPart({
      partName: "",
      partNumber: "",
      manufacturer: "",
      quantity: 1,
      unitPrice: 0,
      description: "",
      supplier: "",
    })
    toast.success("Part added")
  }

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index))
  }

  const handleToggleMechanic = (mechanicId: number) => {
    setSelectedMechanics((prev) =>
      prev.includes(mechanicId)
        ? prev.filter((id) => id !== mechanicId)
        : [...prev, mechanicId]
    )
  }

  const handleCreateJob = async () => {
    // Validation
    if (!title || !description || !instructions) {
      setErrorMessage("Please fill in title, description, and instructions")
      return
    }

    if (selectedMechanics.length === 0) {
      setErrorMessage("Please assign at least one mechanic")
      return
    }

    if (!scheduledDate) {
      setErrorMessage("Please set a scheduled date")
      return
    }

    if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
      setErrorMessage("Please enter a valid estimated cost")
      return
    }

    if (!error?.vehicleId) {
      setErrorMessage("Vehicle information missing")
      return
    }

    if (!error?.errorId) {
      setErrorMessage("Error ID is missing - cannot create job from this error")
      return
    }

    try {
      setIsCreating(true)
      setErrorMessage(null)

      // Format scheduledDate: datetime-local returns "YYYY-MM-DDTHH:mm"
      // We need to send it as "YYYY-MM-DDTHH:mm:ss" format (no Z, no milliseconds)
      const formattedScheduledDate = scheduledDate ? `${scheduledDate}:00` : ""

      // Build payload with required fields
      const basePayload = {
        title,
        description,
        instructions,
        priority,
        vehicleId: error.vehicleId,
        scheduledDate: formattedScheduledDate,
        estimatedCost: parseFloat(estimatedCost),
        mechanicIds: selectedMechanics,
        requiredParts: parts,
      }

      // Only add vehicleErrorId if errorId exists
      const payload: CreateServiceJobRequest = error.errorId
        ? { ...basePayload, vehicleErrorId: error.errorId }
        : basePayload

      console.log("Creating service job with payload:", JSON.stringify(payload, null, 2))
      console.log("Scheduled Date formatted:", formattedScheduledDate)
      console.log("Error details - errorId:", error.errorId, "vehicleId:", error.vehicleId)
      
      const createdJob = await FleetManagerServiceJobService.createServiceJob(payload)

      toast.success(`Service Job "${createdJob.jobNumber}" created successfully`)
      onOpenChange(false)
      resetForm()
      onCreateSuccess?.()
    } catch (err) {
      const apiError = err as Error & { response?: { status: number; data: ErrorMessage } }
      console.error("Failed to create service job:", err)
      console.error("Full error response:", apiError.response?.data)
      setErrorMessage(apiError.response?.data?.message || "Failed to create service job. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setInstructions("")
    setPriority("MEDIUM")
    setScheduledDate("")
    setEstimatedCost("")
    setSelectedMechanics([])
    setParts([])
    setCurrentPart({
      partName: "",
      partNumber: "",
      manufacturer: "",
      quantity: 1,
      unitPrice: 0,
      description: "",
      supplier: "",
    })
    setErrorMessage(null)
    setActiveTab("basic")
  }

  if (!error) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isDark ? "bg-linear-to-b from-slate-900 to-slate-950 border-slate-700" : "bg-linear-to-b from-white to-slate-50 border-slate-300"} max-w-3xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl`}>
        {/* Header with Gradient Background */}
        <DialogHeader className={`relative pb-6 ${isDark ? "bg-linear-to-r from-blue-600 to-indigo-600" : "bg-linear-to-r from-blue-500 to-indigo-500"} rounded-t-lg`}>
          <div className="text-white">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Wrench className="h-6 w-6" />
              Create Service Job
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              {error?.errorCode} • {error?.title} • Vehicle: <span className="font-semibold">{error?.plateNumber}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Error Alert */}
        {errorMessage && (
          <div className={`mx-6 mt-6 rounded-xl p-4 flex gap-3 border-l-4 ${isDark ? "bg-red-500/10 border-l-red-500 border border-red-500/20" : "bg-red-50 border-l-red-500 border border-red-200"}`}>
            <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${isDark ? "text-red-400" : "text-red-600"}`} />
            <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{errorMessage}</p>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Tabs - Modern Design */}
          <div className={`mx-6 mt-6 flex gap-1 p-1 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-200/30"} w-fit`}>
            {(["basic", "mechanics", "parts"] as const).map((tab) => {
              const icons = { basic: Wrench, mechanics: Users, parts: Package }
              const IconComponent = icons[tab]
              const labels = { basic: "Job Details", mechanics: "Mechanics", parts: "Parts" }
              const counts = { basic: null, mechanics: selectedMechanics.length, parts: parts.length }
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-md font-medium transition-all flex items-center gap-2 text-sm ${
                    activeTab === tab
                      ? isDark
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : isDark
                      ? "text-slate-400 hover:text-slate-300"
                      : "text-slate-600 hover:text-slate-700"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {labels[tab]}
                  {counts[tab] !== null && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab
                        ? "bg-white/20"
                        : isDark
                        ? "bg-slate-700"
                        : "bg-slate-300"
                    }`}>
                      {counts[tab]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4 space-y-5">
            {/* Basic Details Tab */}
            {activeTab === "basic" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label className={`font-semibold flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <Wrench className="h-4 w-4 text-blue-500" />
                    Job Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Fix Engine Oil Leak"
                    className={`rounded-lg font-medium ${isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-slate-50 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Description & Details
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Include error code, subsystem, and detailed description..."
                    rows={3}
                    className={`rounded-lg resize-none ${isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-slate-50 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                  />
                </div>

                {/* Instructions Field */}
                <div className="space-y-2">
                  <Label className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Work Instructions
                  </Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Step-by-step instructions for the mechanic to follow..."
                    rows={4}
                    className={`rounded-lg resize-none ${isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-slate-50 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                  />
                </div>

                {/* Priority & Date - Two Column */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={`font-semibold flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <Flag className="h-4 w-4 text-orange-500" />
                      Priority
                    </Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as ServiceJobPriority)}>
                      <SelectTrigger className={`rounded-lg font-medium ${isDark ? "bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20" : "bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW" className="flex items-center gap-2">🟢 Low</SelectItem>
                        <SelectItem value="MEDIUM" className="flex items-center gap-2">🟡 Medium</SelectItem>
                        <SelectItem value="HIGH" className="flex items-center gap-2">🟠 High</SelectItem>
                        <SelectItem value="URGENT" className="flex items-center gap-2">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={`font-semibold flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Scheduled Date
                    </Label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={`rounded-lg font-medium ${isDark ? "bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20" : "bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"}`}
                    />
                  </div>
                </div>

                {/* Estimated Cost */}
                <div className="space-y-2">
                  <Label className={`font-semibold flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Estimated Cost
                  </Label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>$</span>
                    <Input
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className={`rounded-lg font-medium pl-7 ${isDark ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-slate-50 border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mechanics Tab */}
            {activeTab === "mechanics" && (
              <div className="space-y-4 animate-fadeIn">
                <p className={`text-sm font-medium flex items-center gap-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <Users className="h-4 w-4 text-blue-500" />
                  Select mechanics to assign to this service job
                </p>

                {loadingMechanics ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Loading mechanics...</p>
                    </div>
                  </div>
                ) : mechanics.length === 0 ? (
                  <div className={`p-8 rounded-xl text-center border-2 border-dashed ${isDark ? "bg-slate-800/30 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-300 text-slate-600"}`}>
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No mechanics available</p>
                    <p className="text-sm opacity-70">There are no mechanics in your department</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-100 overflow-y-auto pr-2">
                    {mechanics.map((mechanic) => (
                      <button
                        key={mechanic.id}
                        onClick={() => handleToggleMechanic(mechanic.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left transform hover:scale-105 ${
                          selectedMechanics.includes(mechanic.id)
                            ? isDark
                              ? "border-blue-500 bg-linear-to-br from-blue-600/20 to-blue-500/10 shadow-lg shadow-blue-500/20"
                              : "border-blue-400 bg-linear-to-br from-blue-100 to-blue-50 shadow-lg shadow-blue-400/20"
                            : isDark
                            ? "border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50"
                            : "border-slate-300 hover:border-slate-400 bg-slate-100/50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                              {mechanic.email.split("@")[0]}
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {mechanic.email}
                            </p>
                            {mechanic.id && (
                              <p className={`text-xs mt-1 font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                ID: {mechanic.id}
                              </p>
                            )}
                          </div>
                          {selectedMechanics.includes(mechanic.id) && (
                            <div className="ml-2 shrink-0">
                              <div className="rounded-full bg-blue-500 p-1 animate-pulse">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Parts Tab */}
            {activeTab === "parts" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Existing Parts */}
                {parts.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <Package className="h-4 w-4 text-green-500" />
                      Required Parts ({parts.length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {parts.map((part, idx) => (
                        <Card key={idx} className={`border-l-4 border-l-green-500 transition-all hover:shadow-lg ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-linear-to-r from-green-50/50 to-transparent border-slate-200"}`}>
                          <CardContent className="pt-3 pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                                  {part.partName}
                                </p>
                                <p className={`text-xs mt-1 space-x-2 flex flex-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  <span>#{part.partNumber}</span>
                                  <span>•</span>
                                  <span className="font-mono">{part.manufacturer}</span>
                                  <span>•</span>
                                  <span>Qty: {part.quantity}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-green-600">${(part.unitPrice * part.quantity).toFixed(2)}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemovePart(idx)}
                                className={`p-2 rounded-lg transition-colors ml-2 shrink-0 ${
                                  isDark
                                    ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                    : "hover:bg-red-100 text-red-600 hover:text-red-700"
                                }`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Part Form */}
                <Card className={`border-2 border-dashed ${isDark ? "bg-slate-800/30 border-slate-700" : "bg-slate-50/50 border-slate-300"}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plus className="h-4 w-4 text-blue-500" />
                      Add Required Part
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Part Name *"
                        value={currentPart.partName}
                        onChange={(e) => setCurrentPart({ ...currentPart, partName: e.target.value })}
                        className={`rounded-lg ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                      />
                      <Input
                        placeholder="Part Number *"
                        value={currentPart.partNumber}
                        onChange={(e) => setCurrentPart({ ...currentPart, partNumber: e.target.value })}
                        className={`rounded-lg ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Manufacturer"
                        value={currentPart.manufacturer}
                        onChange={(e) => setCurrentPart({ ...currentPart, manufacturer: e.target.value })}
                        className={`rounded-lg ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={currentPart.quantity}
                        onChange={(e) => setCurrentPart({ ...currentPart, quantity: parseInt(e.target.value) || 1 })}
                        min="1"
                        className={`rounded-lg ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={currentPart.unitPrice}
                        onChange={(e) => setCurrentPart({ ...currentPart, unitPrice: parseFloat(e.target.value) || 0 })}
                        step="0.01"
                        className={`rounded-lg ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                      />
                    </div>

                    <Input
                      placeholder="Supplier"
                      value={currentPart.supplier}
                      onChange={(e) => setCurrentPart({ ...currentPart, supplier: e.target.value })}
                      className={`rounded-lg ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                    />

                    <Textarea
                      placeholder="Part Description"
                      value={currentPart.description}
                      onChange={(e) => setCurrentPart({ ...currentPart, description: e.target.value })}
                      rows={2}
                      className={`rounded-lg resize-none ${isDark ? "bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20" : "bg-white border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"}`}
                    />

                    <Button
                      onClick={handleAddPart}
                      variant="outline"
                      className={`w-full gap-2 rounded-lg font-medium transition-all ${isDark ? "hover:bg-blue-600/20 hover:border-blue-500/50" : "hover:bg-blue-50 hover:border-blue-400"}`}
                    >
                      <Plus className="h-4 w-4" />
                      Add Part
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        {selectedMechanics.length > 0 && (
          <div className={`mx-6 mb-6 rounded-xl p-4 border-t border-dashed ${isDark ? "bg-linear-to-r from-blue-600/10 to-indigo-600/10 border-blue-500/30" : "bg-linear-to-r from-blue-100 to-indigo-100 border-blue-200"}`}>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-600"}`}>Priority</p>
                <p className={`text-lg font-bold mt-1 ${priority === "URGENT" ? "text-red-600" : priority === "HIGH" ? "text-orange-600" : priority === "MEDIUM" ? "text-yellow-600" : "text-green-600"}`}>
                  {priority}
                </p>
              </div>
              <div className="text-center border-l border-r border-blue-300/50 dark:border-blue-700/50">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-600"}`}>Mechanics</p>
                <p className="text-lg font-bold mt-1 text-blue-600">{selectedMechanics.length}</p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-600"}`}>Parts</p>
                <p className="text-lg font-bold mt-1 text-emerald-600">{parts.length}</p>
              </div>
              <div className="text-center border-l border-blue-300/50 dark:border-blue-700/50">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-600"}`}>Est. Cost</p>
                <p className="text-lg font-bold mt-1 text-green-600">${estimatedCost || "0.00"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions - Sticky Footer */}
        <div className={`flex gap-3 px-6 py-4 border-t ${isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"}`}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            className={`flex-1 rounded-lg font-medium transition-all ${isDark ? "hover:bg-slate-800 border-slate-700" : "hover:bg-slate-100"}`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateJob}
            disabled={isCreating}
            className="flex-1 rounded-lg font-medium gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-white"
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCreating ? "Creating..." : "Create Service Job"}
            {!isCreating && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
