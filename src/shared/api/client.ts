import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { message } from 'antd'
import type { FormInstance } from 'antd'
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

/**
 * Aplica el error de la API al formulario o lo muestra como aviso global.
 *
 * - Con `errors` (mapa campo → mensaje en snake_case): ancla cada mensaje bajo su
 *   input. Antd enfoca el primero y limpia el error al editar el campo.
 * - Sin `errors` (conflicto de estado, credenciales, autoprotección): toast.
 *
 * El login queda fuera a propósito: su mensaje es genérico para no revelar si
 * existe la cuenta.
 */
export function applyApiError(
  error: unknown,
  form: FormInstance,
  fallbackMessage: string,
): void {
  const fieldErrors = getFieldErrors(error)
  const entries = Object.entries(fieldErrors)

  if (entries.length === 0) {
    message.error(getErrorMessage(error, fallbackMessage))
    return
  }

  // Solo se anclan los campos que el formulario declara; el resto iría a un
  // input inexistente y el usuario no vería nada.
  const declared = new Set(Object.keys(form.getFieldsValue(true) ?? {}))
  const known: { name: string | string[]; errors: string[] }[] = []
  const orphans: string[] = []

  for (const [field, msg] of entries) {
    const root = field.split('.')[0]
    if (declared.has(root)) {
      known.push({
        name: field.includes('.') ? field.split('.') : field,
        errors: [msg],
      })
    } else {
      orphans.push(msg)
    }
  }

  if (known.length > 0) form.setFields(known)
  // Un error de campo que este formulario no muestra debe avisarse igual.
  if (orphans.length > 0) message.error(orphans.join(' '))
}
