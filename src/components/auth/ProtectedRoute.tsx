import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import type { UserRole } from "@/types/auth.types"
import { useAuth } from "@/hooks/useAuth"

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, getRole, getDashboardPath } = useAuth()

  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  const role = getRole()

  if (!role) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const safeDestination = getDashboardPath(role)
    return <Navigate to={safeDestination} replace />
  }

  return <>{children}</>
}
