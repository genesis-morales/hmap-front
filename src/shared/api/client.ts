import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env, TOKEN_STORAGE_KEY } from '@/shared/config/env'

/** Instancia axios central para toda la app. */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Adjunta el JWT (si existe) a cada petición.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Limpia la sesión ante un 401.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
    return Promise.reject(error)
  },
)

/**
 * Extrae un mensaje de error legible de una respuesta de la API.
 * Soporta tanto `{ message }` (E1/E2/E3) como `{ detail }` (ProblemDetail, E4).
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error. Intenta de nuevo.',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; detail?: string }
      | undefined
    return data?.message ?? data?.detail ?? error.message ?? fallback
  }
  return fallback
}

/**
 * Extrae errores de validación por campo de una respuesta ProblemDetail.
 * Retorna un objeto `campo → mensaje` para pintar errores junto a los inputs.
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string> } | undefined
    return data?.errors ?? {}
  }
  return {}
}
