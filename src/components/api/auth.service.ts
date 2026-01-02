import { httpClient } from "./httpClient"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../../types/auth.types"

export const AuthService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>(
      "/api/auth/login",
      payload
    )
    return response.data
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const response = await httpClient.post<RegisterResponse>(
      "/api/auth/register",
      payload
    )
    return response.data
  },
}