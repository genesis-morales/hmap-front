import { apiClient } from '@/shared/api/client'
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from '@/features/auth/types'

/**
 * Servicio de autenticación. Rutas con convención REST;
 */
export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<AuthResponse>('/auth/login', payload).then((r) => r.data)
  },

  register(payload: RegisterRequest) {
    return apiClient.post<AuthResponse>('/auth/register', payload).then((r) => r.data)
  },

  /** Solicita el enlace de recuperación (HU-005). */
  forgotPassword(payload: ForgotPasswordRequest) {
    return apiClient.post<void>('/auth/forgot-password', payload).then((r) => r.data)
  },

  /** Restablece la contraseña con el token del enlace (HU-006). */
  resetPassword(payload: ResetPasswordRequest) {
    return apiClient.post<void>('/auth/reset-password', payload).then((r) => r.data)
  },

  /** Usuario autenticado a partir del token vigente. */
  me() {
    return apiClient.get<User>('/auth/me').then((r) => r.data)
  },
}
