/**
 * Configuración de entorno centralizada.
 * Variables inyectadas por Vite (prefijo VITE_).
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
} as const

/** Clave del token JWT en localStorage. */
export const TOKEN_STORAGE_KEY = 'hmap.token'
