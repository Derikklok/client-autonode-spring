import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Gauge, Droplet, Thermometer, LayoutGrid, Table2 } from "lucide-react"
import { toast } from "sonner"
import { MechanicService } from "@/components/api/mechanic.service"
import type { HubLog } from "@/types/mechanic.types"

interface HubLogsViewerProps {
  isDark: boolean
}

export function HubLogsViewer({ isDark }: HubLogsViewerProps) {
  const [logs, setLogs] = useState<HubLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [viewMode, setViewMode] = useState<"card" | "table">("card")

  useEffect(() => {
    fetchHubLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchHubLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await MechanicService.getHubLogs(currentPage, pageSize)
      setLogs(response.content)
      setTotalElements(response.totalElements)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load hub logs"
      setError(message)
      toast.error(message)
      console.error("Failed to fetch hub logs:", err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalElements / pageSize)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (error) {
    return (
      <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
        <CardContent className="pt-8">
          <div className="flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Hub Telemetry Logs
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Card
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <Table2 className="h-4 w-4" />
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardContent className="pt-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-yellow-600 dark:text-yellow-400" />
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardContent className="pt-8">
            <div className="text-center text-slate-500 dark:text-slate-400">
              No hub logs available
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logs.map((log) => (
            <Card
              key={log.id}
              className={`transition-all ${
                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white hover:bg-slate-50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{log.vehiclePlateNumber}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Vehicle ID: {log.vehicleId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Speed */}
                <div className="flex items-center justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium">Speed</span>
                  </div>
                  <span className="font-semibold">{log.speed.toFixed(1)} km/h</span>
                </div>

                {/* Fuel Level */}
                <div className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Fuel</span>
                  </div>
                  <span className="font-semibold">{log.fuelLevel.toFixed(1)}%</span>
                </div>

                {/* Engine Temperature */}
                <div className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium">Engine Temp</span>
                  </div>
                  <span className="font-semibold">{log.engineTemperature.toFixed(1)}°C</span>
                </div>

                {/* Timestamp */}
                <div className={`text-xs p-2 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                    {formatDateTime(log.recordedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                    <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
                    <th className="px-4 py-3 text-left font-semibold">Speed</th>
                    <th className="px-4 py-3 text-left font-semibold">Fuel Level</th>
                    <th className="px-4 py-3 text-left font-semibold">Engine Temp</th>
                    <th className="px-4 py-3 text-left font-semibold">Recorded At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={`border-b transition-colors ${
                        isDark
                          ? `border-slate-800 ${idx % 2 === 0 ? "bg-slate-900" : "bg-slate-800/50"} hover:bg-slate-800`
                          : `border-slate-200 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-slate-100`
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{log.vehiclePlateNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          {log.speed.toFixed(1)} km/h
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          {log.fuelLevel.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-600 dark:text-red-400" />
                          {log.engineTemperature.toFixed(1)}°C
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(log.recordedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className={isDark ? "bg-slate-900 border-slate-800" : "bg-white"}>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage + 1} of {totalPages} ({totalElements} total logs)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
