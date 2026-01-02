import type { UserRole } from "@/types/auth.types"

export const roleDashboardRoutes: Record<UserRole, string> = {
  ADMIN: "/admin-dashboard",
  FLEET_MANAGER: "/fleet-manager-dashboard",
  MECHANIC: "/mechanic-dashboard",
  DRIVER: "/driver-dashboard",
}
