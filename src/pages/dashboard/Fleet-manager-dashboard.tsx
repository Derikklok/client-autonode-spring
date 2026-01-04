
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-context"
import { useAuth } from "@/hooks/useAuth"

import { FleetManagerVehicles } from "@/components/fleet-manager/Vehicles"
import { FleetManagerHubs } from "@/components/fleet-manager/Hubs"
import { FleetManagerUsers } from "@/components/fleet-manager/Users"
import { FleetManagerServiceJobs } from "@/components/fleet-manager/Service-jobs"
import { FleetManagerSettings } from "@/components/fleet-manager/Settings"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Truck, MapPin, Users, Wrench, Settings, LogOut, Menu } from "lucide-react"

type Section = "vehicles" | "hubs" | "users" | "service-jobs" | "settings"

interface NavItem {
  id: Section
  label: string
  icon: React.ReactNode // Lucide icon component
  description: string
}

const navItems: NavItem[] = [
  {
    id: "vehicles",
    label: "Vehicles",
    icon: <Truck className="h-5 w-5" />,
    description: "Manage your fleet vehicles",
  },
  {
    id: "hubs",
    label: "Hubs",
    icon: <MapPin className="h-5 w-5" />,
    description: "Manage distribution hubs",
  },
  {
    id: "users",
    label: "Users",
    icon: <Users className="h-5 w-5" />,
    description: "Manage drivers and staff",
  },
  {
    id: "service-jobs",
    label: "Service Jobs",
    icon: <Wrench className="h-5 w-5" />,
    description: "Track maintenance tasks",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    description: "Fleet manager preferences",
  },
]

function FleetManagerDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<Section>("vehicles")

  const isDark = theme === "dark"

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
    navigate("/", { replace: true })
  }

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const getBreadcrumbs = () => {
    const activeItem = navItems.find((item) => item.id === activeSection)
    return [
      { label: "Dashboard", href: "/fleet-manager-dashboard" },
      { label: activeItem?.label || "Vehicles", href: "#" },
    ]
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "vehicles":
        return <FleetManagerVehicles isDark={isDark} />
      case "hubs":
        return <FleetManagerHubs isDark={isDark} />
      case "users":
        return <FleetManagerUsers isDark={isDark} />
      case "service-jobs":
        return <FleetManagerServiceJobs isDark={isDark} />
      case "settings":
        return <FleetManagerSettings isDark={isDark} />
      default:
        return <FleetManagerVehicles isDark={isDark} />
    }
  }

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
        {/* Sidebar */}
        <Sidebar className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
          <SidebarHeader className={`border-b ${isDark ? "border-white/10" : "border-slate-200"} px-6 py-4`}>
            <div className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
              <Truck className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  AutoNode
                </p>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Fleet Manager
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-6">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group relative rounded-lg px-4 py-3 transition-all ${
                      activeSection === item.id
                        ? isDark
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : isDark
                          ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 shrink-0 ${
                        activeSection === item.id
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : ""
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {activeSection === item.id && (
                      <div className="absolute inset-y-0 right-0 w-1 rounded-l-lg bg-blue-500" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className={`border-t ${isDark ? "border-white/10" : "border-slate-200"} px-4 py-6`}>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className={`w-full ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}
                      >
                        <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          FM
                        </span>
                      </div>
                      <span className="truncate">Fleet Manager</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="end"
                    className={isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}
                  >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={toggleTheme}>
                      {isDark ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div
            className={`sticky top-0 z-40 border-b ${isDark ? "border-white/10 bg-slate-900/80 backdrop-blur-xl" : "border-slate-200 bg-white/80 backdrop-blur-xl"}`}
          >
            <div className="flex items-center justify-between gap-4 px-8 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600"}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Breadcrumb>
                  <BreadcrumbList>
                    {getBreadcrumbs().map((breadcrumb, index) => (
                      <div key={breadcrumb.label} className="flex items-center gap-2">
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            href={breadcrumb.href}
                            className={isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}
                          >
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className={isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className={isDark ? "border-white/10 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto px-8 py-8">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default FleetManagerDashboard