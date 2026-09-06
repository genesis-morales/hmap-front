import { apiClient } from '@/shared/api/client'
import type { PageResponse } from '@/shared/api/types'
import type {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserActiveRequest,
  UserQuery,
} from '@/features/admin/types'

/**
 * API del Panel de Administrador (E4). Todas requieren rol ADMINISTRADOR
 * (la autorización real la aplica la API con 403 si no se cumple).
 */
export const adminUsersApi = {
  /** Nómina paginada con filtros (HU-034). */
  list(query: UserQuery = {}) {
    return apiClient
      .get<PageResponse<AdminUser>>('/users', { params: query })
      .then((r) => r.data)
  },

  /** Crear cuenta interna con rol y contraseña inicial (HU-030/032). */
  create(payload: CreateUserRequest) {
    return apiClient.post<AdminUser>('/users', payload).then((r) => r.data)
  },

  /** Editar datos y reasignar rol (HU-031/032). Email no editable. */
  update(id: number, payload: UpdateUserRequest) {
    return apiClient.put<AdminUser>(`/users/${id}`, payload).then((r) => r.data)
  },

  /** Activar o suspender cuenta (HU-033). */
  setActive(id: number, active: boolean, observation?: string) {
    const payload: UpdateUserActiveRequest = { active, observation }
    return apiClient
      .patch<AdminUser>(`/users/${id}/active`, payload)
      .then((r) => r.data)
  },
}
