import { AuthService } from "@/components/api/auth.service"
import { roleDashboardRoutes } from "@/constants/role-routes"
import type { UserRole } from "@/types/auth.types"

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password })

    localStorage.setItem("token", response.token)
    localStorage.setItem("role", response.role)

    return response
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
  }

  const getRole = (): UserRole | null => {
    return localStorage.getItem("role") as UserRole | null
  }

  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("token")
  }

  const getDashboardPath = (role?: UserRole | null) => {
    if (!role) return "/"
    return roleDashboardRoutes[role]
  }

  return { login, logout, getRole, isAuthenticated, getDashboardPath }
}