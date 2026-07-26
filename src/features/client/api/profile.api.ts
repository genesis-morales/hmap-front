import { apiClient } from '@/shared/api/client'
import type { User } from '@/features/auth/types'
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '@/features/client/types'

/** Perfil del cliente (HU-014, HU-015). */
export const profileApi = {
  /** Actualiza nombre, apellido y teléfono. El email no se edita. */
  updateMe(payload: UpdateProfileRequest) {
    return apiClient.put<User>('/users/me', payload).then((r) => r.data)
  },

  /** Cambia la contraseña validando la actual (400 si no coincide). */
  changePassword(payload: ChangePasswordRequest) {
    return apiClient.post<void>('/auth/change-password', payload).then((r) => r.data)
  },
}
