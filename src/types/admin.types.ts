export type UserRole = "ADMIN" | "FLEET_MANAGER" | "MECHANIC" | "DRIVER"

export interface AdminUser {
  id: number
  email: string
  role: UserRole
  departmentName: string
}

export interface AdminUserResponse {
  id: number
  email: string
  role: string
  departmentName: string
}
