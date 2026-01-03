import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { CreateUserDialog } from "@/components/admin/Create-user"
import GetDepartment from "@/components/admin/Get-department"
import { CreateDepartmentDialog } from "@/components/admin/Create-departement-model"
import { ViewAllDepartmentsDrawer } from "@/components/admin/View-all-departments-model"
import { AdminUserManagement } from "@/components/admin/Admin-user-management"

const serviceClusters = [
  {
    name: "Fleet Orchestration",
    status: "Operational",
    statusTone: "text-emerald-300",
    latency: "124 ms",
    uptime: "99.995%",
    summary: "Dispatch, assignments, and live vehicle telemetry are stable.",
  },
  {
    name: "Diagnostics Cloud",
    status: "Degraded",
    statusTone: "text-amber-300",
    latency: "321 ms",
    uptime: "99.2%",
    summary: "Predictive maintenance queues running slower than baseline.",
  },
  {
    name: "Driver Services",
    status: "Operational",
    statusTone: "text-emerald-300",
    latency: "89 ms",
    uptime: "99.991%",
    summary: "Mobile communications and shift management within expectations.",
  },
  {
    name: "Compliance Hub",
    status: "Attention",
    statusTone: "text-sky-300",
    latency: "167 ms",
    uptime: "100%",
    summary: "Upcoming audits require document verification in the next 48h.",
  },
]

const spotlightMetrics = [
  {
    label: "Assets Online",
    value: "482",
    delta: "+18",
    note: "vs last 24h",
    tone: "text-emerald-300",
  },
  {
    label: "Incidents",
    value: "3",
    delta: "-2",
    note: "resolved overnight",
    tone: "text-emerald-300",
  },
  {
    label: "Open Work Orders",
    value: "27",
    delta: "+4",
    note: "awaiting technician",
    tone: "text-amber-300",
  },
  {
    label: "Compliance Deadline",
    value: "48h",
    delta: "",
    note: "documentation review",
    tone: "text-sky-300",
  },
]

const initiatives = [
  {
    title: "Autonomous Route Optimization",
    description: "Phase II rollout across west coast hubs with 12% efficiency gain projected.",
    owner: "Fleet Intelligence",
    progress: "64% complete",
    dependencies: "Awaiting regulatory clearance for 2 regions.",
  },
  {
    title: "Predictive Maintenance Mesh",
    description: "Deploying new sensor fusion models to reduce unscheduled downtime.",
    owner: "Diagnostics Cloud",
    progress: "Prototype validated",
    dependencies: "Hardware calibration schedule for Q1.",
  },
]

const activityFeed = [
  {
    title: "Policy update",
    detail: "Driver safety protocols v3.2 published and acknowledged by 86% of staff.",
    time: "12 minutes ago",
  },
  {
    title: "Critical incident resolved",
    detail: "Engine anomaly on unit AX-409 cleared after remote recalibration.",
    time: "42 minutes ago",
  },
  {
    title: "New admin",
    detail: "Maria Chen granted conditional access to Diagnostics Cloud controls.",
    time: "2 hours ago",
  },
]

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [createDepartmentOpen, setCreateDepartmentOpen] = useState(false)
  const [viewAllDepartmentsOpen, setViewAllDepartmentsOpen] = useState(false)
  const [assignRolesOpen, setAssignRolesOpen] = useState(false)

  const isDark = theme === "dark"

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
    navigate("/", { replace: true })
  }

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className={`min-h-screen ${
      isDark
        ? "bg-linear-to-br from-slate-950 via-slate-950/95 to-slate-900 text-slate-100"
        : "bg-linear-to-br from-slate-50 via-white to-slate-100 text-slate-900"
    }`}>
      <nav
        className={`sticky top-0 z-50 border-b ${
          isDark
            ? "border-white/5 bg-slate-950/80 backdrop-blur-xl supports-backdrop-filter:bg-slate-950/70"
            : "border-slate-200 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/70"
        }`}
        aria-label="Administrative function navigation"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>AutoNode</span>
            <Badge variant="outline" className={isDark ? "border-sky-400/30 bg-sky-400/10 text-sky-300" : "border-sky-300/30 bg-sky-100 text-sky-700"}>
              Admin
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`${isDark ? "text-slate-200 hover:bg-white/10 hover:text-slate-100" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}>
                  Users & Access
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Access Control</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setCreateUserOpen(true)}>
                  Create user account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssignRolesOpen(true)}>
                  Assign roles
                </DropdownMenuItem>
                <DropdownMenuItem>Assign to department</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Activate user</DropdownMenuItem>
                <DropdownMenuItem>Deactivate user</DropdownMenuItem>
                <DropdownMenuItem className="text-amber-400">Revoke access</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`${isDark ? "text-slate-200 hover:bg-white/10 hover:text-slate-100" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}>
                  Departments
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Department Operations</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setCreateDepartmentOpen(true)}>
                  Create department
                </DropdownMenuItem>
                <DropdownMenuItem>Edit department</DropdownMenuItem>
                <DropdownMenuItem className="text-amber-400">Delete department</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setViewAllDepartmentsOpen(true)}>
                  View all departments
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`${isDark ? "text-slate-200 hover:bg-white/10 hover:text-slate-100" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}>
                  HUB Devices
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>Device Management</DropdownMenuLabel>
                <DropdownMenuItem>Register new HUB</DropdownMenuItem>
                <DropdownMenuItem>View all devices</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>API Keys</DropdownMenuLabel>
                <DropdownMenuItem>Generate API key</DropdownMenuItem>
                <DropdownMenuItem>Rotate API key</DropdownMenuItem>
                <DropdownMenuItem className="text-amber-400">Revoke API key</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Health Status</DropdownMenuLabel>
                <DropdownMenuItem>Active / Inactive status</DropdownMenuItem>
                <DropdownMenuItem>Last communication</DropdownMenuItem>
                <DropdownMenuItem>Failed auth attempts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`${isDark ? "text-slate-200 hover:bg-white/10 hover:text-slate-100" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}>
                  Monitoring
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>System Metrics</DropdownMenuLabel>
                <DropdownMenuItem>Total vehicles</DropdownMenuItem>
                <DropdownMenuItem>Active HUBs</DropdownMenuItem>
                <DropdownMenuItem>Failed telemetry</DropdownMenuItem>
                <DropdownMenuItem>Critical alerts</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Audit Logs</DropdownMenuLabel>
                <DropdownMenuItem>User actions</DropdownMenuItem>
                <DropdownMenuItem>Configuration changes</DropdownMenuItem>
                <DropdownMenuItem>Security events</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className={isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}
            >
              {isDark ? "☀️" : "🌙"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={isDark ? "rounded-full border-white/20 bg-white/5 text-slate-100 hover:bg-white/10" : "rounded-full border-slate-300 bg-slate-100/50 text-slate-900 hover:bg-slate-200"}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <header className={`relative overflow-hidden border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
        <div className="pointer-events-none absolute inset-0 opacity-80">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(15,23,42,0.7)_0%,rgba(15,23,42,0.2)_55%,rgba(37,99,235,0.25)_100%)]" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(248,250,252,0.9)_0%,rgba(248,250,252,0.4)_55%,rgba(147,197,253,0.15)_100%)]" />
            </>
          )}
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div className="max-w-2xl space-y-5">
              <Badge className={isDark ? "bg-slate-100/10 text-slate-100" : "bg-slate-200 text-slate-700"}>Admin command center</Badge>
              <h1 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${isDark ? "" : "text-slate-900"}`}>Operational overview</h1>
              <p className={`text-base sm:text-lg ${isDark ? "text-slate-200/80" : "text-slate-600"}`}>
                Stay ahead of fleet, diagnostics, compliance, and people operations. The control header surfaces the
                status of each core service so you can intervene before disruption spreads.
              </p>
              <div className={`flex flex-wrap gap-4 text-sm ${isDark ? "text-slate-200/70" : "text-slate-700"}`}>
                <span>Service uptime (7d): <strong className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>99.87%</strong></span>
                <span>Mean response: <strong className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>212 ms</strong></span>
                <span>Last sync: <strong className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>08:24 UTC</strong></span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="outline" size="sm" className={isDark ? "backdrop-blur border-white/20 bg-white/5 text-slate-100" : "backdrop-blur border-slate-300 bg-slate-200/50 text-slate-900"}>
                Schedule maintenance window
              </Button>
              <Button size="sm" className={isDark ? "shadow-[0_12px_40px_-20px_rgba(56,189,248,0.65)]" : "bg-amber-600 text-white hover:bg-amber-700"}>
                Broadcast status update
              </Button>
            </div>
          </div>

          <Separator className={isDark ? "my-10 border-white/10 bg-white/10" : "my-10 border-slate-300 bg-slate-200"} />

          <div className="-mx-2 flex snap-x gap-4 overflow-x-auto pb-4">
            {serviceClusters.map((service) => (
              <Card
                key={service.name}
                className={isDark ? "min-w-65 flex-1 snap-start border-white/10 bg-white/5 backdrop-blur lg:min-w-0" : "min-w-65 flex-1 snap-start border-slate-200 bg-white/70 backdrop-blur lg:min-w-0"}
              >
                <CardHeader className="space-y-2">
                  <div className={`flex items-center justify-between text-xs ${isDark ? "text-slate-200/60" : "text-slate-600"}`}>
                    <span>{service.uptime}</span>
                    <span>{service.latency}</span>
                  </div>
                  <CardTitle className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{service.name}</CardTitle>
                  <CardDescription className={isDark ? "text-slate-200/80" : "text-slate-600"}>{service.summary}</CardDescription>
                </CardHeader>
                <CardFooter className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-200/80" : "text-slate-700"}`}>
                  <span className={`font-semibold ${service.statusTone}`}>{service.status}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-linear-to-r from-emerald-300 to-sky-300" aria-hidden />
                  <span>Auto escalation configured</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <section className="space-y-6 py-4">
          <GetDepartment />
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Spotlight metrics</h2>
              <p className={`text-sm ${isDark ? "text-slate-200/70" : "text-slate-600"}`}>Signals that moved the most in the past day across your network.</p>
            </div>
            <Button variant="ghost" size="sm" className={isDark ? "text-slate-200/80" : "text-slate-700/70"}>
              Configure alerts
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {spotlightMetrics.map((metric) => (
              <Card key={metric.label} className={isDark ? "border-white/10 bg-white/5 backdrop-blur" : "border-slate-200 bg-white/70 backdrop-blur"}>
                <CardHeader className="space-y-1">
                  <CardDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>{metric.label}</CardDescription>
                  <CardTitle className={`text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{metric.value}</CardTitle>
                </CardHeader>
                <CardContent className={`text-sm ${isDark ? "text-slate-200/70" : "text-slate-700"}`}>
                  <span className={`font-semibold ${metric.tone}`}>{metric.delta}</span>
                  {metric.delta ? <span className={`mx-2 ${isDark ? "text-slate-500/50" : "text-slate-400"}`}>|</span> : null}
                  <span>{metric.note}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1.3fr]">
          <Card className={isDark ? "border-white/10 bg-white/5 backdrop-blur" : "border-slate-200 bg-white/70 backdrop-blur"}>
            <CardHeader className="space-y-1">
              <CardTitle className={isDark ? "text-xl" : "text-xl text-slate-900"}>Strategic initiatives</CardTitle>
              <CardDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>
                Cross-functional programs with timelines and dependency watchpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {initiatives.map((initiative) => (
                <div
                  key={initiative.title}
                  className={`rounded-3xl border px-5 py-4 text-sm ${isDark ? "border-white/10 bg-white/5 text-slate-200/80" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{initiative.title}</h3>
                    <Badge variant="outline" className={isDark ? "border-white/20 bg-white/10 text-slate-100" : "border-slate-300 bg-slate-100 text-slate-700"}>
                      {initiative.owner}
                    </Badge>
                  </div>
                  <p className="mt-3 leading-relaxed">{initiative.description}</p>
                  <div className={`mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span>{initiative.progress}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-500" aria-hidden />
                    <span>{initiative.dependencies}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className={isDark ? "border-white/10 bg-white/5 backdrop-blur" : "border-slate-200 bg-white/70 backdrop-blur"}>
              <CardHeader className="space-y-1">
                <CardTitle className={isDark ? "text-xl" : "text-xl text-slate-900"}>Risk & compliance</CardTitle>
                <CardDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>
                  Monitor certifications, audits, and policy adherence in real time.
                </CardDescription>
              </CardHeader>
              <CardContent className={`space-y-4 text-sm ${isDark ? "text-slate-200/80" : "text-slate-700"}`}>
                <div className={`rounded-3xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>DOT quarterly audit</span>
                    <Badge variant="outline" className={isDark ? "border-amber-300/40 bg-amber-200/10 text-amber-200" : "border-amber-300/50 bg-amber-100 text-amber-700"}>
                      Due in 2 days
                    </Badge>
                  </div>
                  <p className={`mt-2 ${isDark ? "text-slate-200/70" : "text-slate-600"}`}>Collect 12 outstanding maintenance certificates for heavy duty class.</p>
                </div>

                <div className={`rounded-3xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Driver compliance</span>
                    <Badge variant="outline" className={isDark ? "border-emerald-300/40 bg-emerald-200/10 text-emerald-200" : "border-emerald-300/50 bg-emerald-100 text-emerald-700"}>
                      92% complete
                    </Badge>
                  </div>
                  <p className={`mt-2 ${isDark ? "text-slate-200/70" : "text-slate-600"}`}>14 drivers pending fatigue management acknowledgment.</p>
                </div>

                <div className={`rounded-3xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Security posture</span>
                    <Badge variant="outline" className={isDark ? "border-sky-300/40 bg-sky-200/10 text-sky-200" : "border-sky-300/50 bg-sky-100 text-sky-700"}>
                      Stable
                    </Badge>
                  </div>
                  <p className={`mt-2 ${isDark ? "text-slate-200/70" : "text-slate-600"}`}>No elevated permission requests in the last 6 hours.</p>
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? "border-white/10 bg-white/5 backdrop-blur" : "border-slate-200 bg-white/70 backdrop-blur"}>
              <CardHeader className="space-y-1">
                <CardTitle className={isDark ? "text-xl" : "text-xl text-slate-900"}>Activity feed</CardTitle>
                <CardDescription className={isDark ? "text-slate-200/70" : "text-slate-600"}>Latest signals that need your attention today.</CardDescription>
              </CardHeader>
              <CardContent className={`space-y-5 text-sm ${isDark ? "text-slate-200/80" : "text-slate-700"}`}>
                {activityFeed.map((item, index) => (
                  <div key={item.title} className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{item.title}</h3>
                      <span className={`text-xs uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.time}</span>
                    </div>
                    <p className="leading-relaxed">{item.detail}</p>
                    {index < activityFeed.length - 1 ? (
                      <Separator className={isDark ? "mt-4 bg-white/5" : "mt-4 bg-slate-200"} />
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <CreateUserDialog open={createUserOpen} onOpenChange={setCreateUserOpen} />
      <CreateDepartmentDialog 
        open={createDepartmentOpen} 
        onOpenChange={setCreateDepartmentOpen}
      />
      <ViewAllDepartmentsDrawer
        open={viewAllDepartmentsOpen}
        onOpenChange={setViewAllDepartmentsOpen}
      />
      <AdminUserManagement
        open={assignRolesOpen}
        onOpenChange={setAssignRolesOpen}
      />
    </div>
  )
}

export default AdminDashboard
