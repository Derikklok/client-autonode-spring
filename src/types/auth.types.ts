export type UserRole = "ADMIN" | "FLEET_MANAGER" | "MECHANIC" | "DRIVER"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  role: UserRole
}

export interface RegisterRequest {
  email: string
  password: string
  role: UserRole
}

export interface RegisterResponse {
  message: string
}