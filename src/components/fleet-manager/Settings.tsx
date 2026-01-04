import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BriefcaseIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { Bell, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface FleetManagerSettings {
  notifications: {
    maintenanceReminders: boolean
    lowFuelAlerts: boolean
    speedingAlerts: boolean
    accidentReports: boolean
    emailNotifications: boolean
    smsNotifications: boolean
  }
  preferences: {
    defaultView: "list" | "map" | "grid"
    autoRefresh: boolean
    refreshInterval: number
    distanceUnit: "km" | "miles"
    currencySymbol: string
    timezone: string
  }
  safety: {
    speedLimitMonitoring: boolean
    driverBehaviorTracking: boolean
    geofencingEnabled: boolean
    dataEncryption: boolean
  }
}

const defaultSettings: FleetManagerSettings = {
  notifications: {
    maintenanceReminders: true,
    lowFuelAlerts: true,
    speedingAlerts: true,
    accidentReports: true,
    emailNotifications: true,
    smsNotifications: false,
  },
  preferences: {
    defaultView: "list",
    autoRefresh: true,
    refreshInterval: 30,
    distanceUnit: "km",
    currencySymbol: "$",
    timezone: "America/Chicago",
  },
  safety: {
    speedLimitMonitoring: true,
    driverBehaviorTracking: true,
    geofencingEnabled: true,
    dataEncryption: true,
  },
}

export function FleetManagerSettings({ isDark }: { isDark: boolean }) {
  const [settings, setSettings] = useState<FleetManagerSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (section: keyof FleetManagerSettings, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
      },
    }))
    setHasChanges(true)
  }

  const handleInputChange = (section: keyof FleetManagerSettings, key: string, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    toast.success("Settings saved successfully!")
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(false)
    toast.info("Settings reset to defaults")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Fleet Manager Settings</h1>
        <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Customize your dashboard, notifications, and fleet management preferences
        </p>
      </div>

      {/* Notification Settings */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
              <Bell className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Control how you receive alerts and updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Alert Types */}
          <div className="space-y-4">
            <h3 className="font-semibold">Alert Types</h3>
            <div className="space-y-3">
              {[
                {
                  key: "maintenanceReminders",
                  label: "Maintenance Reminders",
                  description: "Get notified when vehicles need servicing",
                },
                {
                  key: "lowFuelAlerts",
                  label: "Low Fuel Alerts",
                  description: "Receive alerts when fuel levels are low",
                },
                {
                  key: "speedingAlerts",
                  label: "Speeding Alerts",
                  description: "Get notified of speed limit violations",
                },
                {
                  key: "accidentReports",
                  label: "Accident Reports",
                  description: "Immediate notifications of incidents",
                },
              ].map((alert) => (
                <div
                  key={alert.key}
                  className={`flex items-center justify-between rounded-lg p-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
                >
                  <div>
                    <p className="font-medium">{alert.label}</p>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {alert.description}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleToggle(
                        "notifications",
                        alert.key as keyof typeof settings.notifications
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications[
                        alert.key as keyof typeof settings.notifications
                      ]
                        ? "bg-emerald-500"
                        : isDark
                          ? "bg-slate-700"
                          : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications[
                          alert.key as keyof typeof settings.notifications
                        ]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Separator className={isDark ? "bg-white/10" : ""} />

          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="font-semibold">Notification Channels</h3>
            <div className="space-y-3">
              {[
                { key: "emailNotifications", label: "Email Notifications" },
                { key: "smsNotifications", label: "SMS Notifications" },
              ].map((channel) => (
                <div
                  key={channel.key}
                  className={`flex items-center justify-between rounded-lg p-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
                >
                  <p className="font-medium">{channel.label}</p>
                  <button
                    onClick={() =>
                      handleToggle(
                        "notifications",
                        channel.key as keyof typeof settings.notifications
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications[
                        channel.key as keyof typeof settings.notifications
                      ]
                        ? "bg-emerald-500"
                        : isDark
                          ? "bg-slate-700"
                          : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications[
                          channel.key as keyof typeof settings.notifications
                        ]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-50"}`}>
              <HugeiconsIcon
                icon={BriefcaseIcon}
                className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Set your dashboard and operational preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Display Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultView">Default View</Label>
              <Select
                value={settings.preferences.defaultView}
                onValueChange={(value) =>
                  handleInputChange(
                    "preferences",
                    "defaultView",
                    value as "list" | "map" | "grid"
                  )
                }
              >
                <SelectTrigger
                  id="defaultView"
                  className={isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="map">Map View</SelectItem>
                  <SelectItem value="grid">Grid View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distanceUnit">Distance Unit</Label>
              <Select
                value={settings.preferences.distanceUnit}
                onValueChange={(value) =>
                  handleInputChange(
                    "preferences",
                    "distanceUnit",
                    value as "km" | "miles"
                  )
                }
              >
                <SelectTrigger
                  id="distanceUnit"
                  className={isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers (km)</SelectItem>
                  <SelectItem value="miles">Miles (mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency Symbol</Label>
              <Select
                value={settings.preferences.currencySymbol}
                onValueChange={(value) =>
                  handleInputChange("preferences", "currencySymbol", value)
                }
              >
                <SelectTrigger
                  id="currency"
                  className={isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">USD ($)</SelectItem>
                  <SelectItem value="€">EUR (€)</SelectItem>
                  <SelectItem value="£">GBP (£)</SelectItem>
                  <SelectItem value="¥">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.preferences.timezone}
                onValueChange={(value) =>
                  handleInputChange("preferences", "timezone", value)
                }
              >
                <SelectTrigger
                  id="timezone"
                  className={isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className={isDark ? "bg-white/10" : ""} />

          {/* Auto-refresh Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Refresh Dashboard</p>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Automatically update data at intervals
                </p>
              </div>
              <button
                onClick={() =>
                  handleToggle("preferences", "autoRefresh")
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.preferences.autoRefresh
                    ? "bg-emerald-500"
                    : isDark
                      ? "bg-slate-700"
                      : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.preferences.autoRefresh
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {settings.preferences.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">
                  Refresh Interval (seconds)
                </Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  min={10}
                  max={300}
                  value={settings.preferences.refreshInterval}
                  onChange={(e) =>
                    handleInputChange(
                      "preferences",
                      "refreshInterval",
                      parseInt(e.target.value)
                    )
                  }
                  className={isDark ? "border-white/10 bg-slate-800" : "border-slate-200"}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Safety Settings */}
      <Card className={isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-emerald-500/20" : "bg-emerald-50"}`}>
              <HugeiconsIcon
                icon={Settings01Icon}
                className={`h-5 w-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
            <div>
              <CardTitle>Safety & Security</CardTitle>
              <CardDescription>
                Monitor fleet safety and data protection
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {[
            {
              key: "speedLimitMonitoring",
              label: "Speed Limit Monitoring",
              description: "Track and monitor vehicle speed violations",
            },
            {
              key: "driverBehaviorTracking",
              label: "Driver Behavior Tracking",
              description: "Monitor driving patterns and behavior",
            },
            {
              key: "geofencingEnabled",
              label: "Geofencing",
              description: "Enable location-based alerts and restrictions",
            },
            {
              key: "dataEncryption",
              label: "Data Encryption",
              description: "Encrypt sensitive fleet data",
            },
          ].map((setting) => (
            <div
              key={setting.key}
              className={`flex items-center justify-between rounded-lg p-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
            >
              <div>
                <p className="font-medium">{setting.label}</p>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() =>
                  handleToggle("safety", setting.key as keyof typeof settings.safety)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.safety[setting.key as keyof typeof settings.safety]
                    ? "bg-emerald-500"
                    : isDark
                      ? "bg-slate-700"
                      : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.safety[setting.key as keyof typeof settings.safety]
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
