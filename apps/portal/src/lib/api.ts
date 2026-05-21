import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const api = axios.create({
  baseURL:
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_GRANVILLE_API_URL ?? 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().auth.reset()
    }
    return Promise.reject(err)
  }
)
