import axios from "axios"

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Attach token automatically (except for login/register endpoints)
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  const isAuthEndpoint = config.url?.includes("/auth/login") || config.url?.includes("/auth/register")
  
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
    }
    return Promise.reject(error)
  }
)