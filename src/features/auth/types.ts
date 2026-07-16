/** Roles del sistema HMAP. */
export type UserRole = 'CLIENTE' | 'RECEPCIONISTA' | 'ADMINISTRADOR'

export interface User {
  id: string | number
  name: string
  last_name: string
  email: string
  role: UserRole
}

// --- Payloads de request ---
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  last_name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

// --- Respuestas ---
export interface AuthResponse {
  token: string
  user: User
}
