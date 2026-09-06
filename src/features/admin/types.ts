import type { UserRole } from '@/features/auth/types'

/** Roles que el admin puede asignar (el backend rechaza CLIENTE con 400). */
export type AssignableRole = 'ADMINISTRADOR' | 'RECEPCIONISTA'

/** Usuario en la nómina del panel admin (GET /users). */
export interface AdminUser {
  id: number
  name: string
  last_name: string
  email: string
  phone: string | null
  role: UserRole
  active: boolean
  /** Motivo de la desactivación (null si nunca fue desactivado o fue reactivado). */
  deactivation_reason: string | null
  created_at: string // ISO datetime
}

/** POST /users — alta de cuenta interna. */
export interface CreateUserRequest {
  name: string
  last_name: string
  email: string
  phone?: string | null
  password: string // 8–100 caracteres
  role: AssignableRole
}

/** PUT /users/{id} — edición de cuenta (sin email ni password). */
export interface UpdateUserRequest {
  name: string
  last_name: string
  phone?: string | null
  role: AssignableRole
}

/** PATCH /users/{id}/active — activar/suspender. */
export interface UpdateUserActiveRequest {
  active: boolean
  /** Motivo de la desactivación (obligatorio cuando active: false). */
  observation?: string
}

/** Filtros de GET /users (todos opcionales). */
export interface UserQuery {
  role?: UserRole
  active?: boolean
  search?: string
  /** 0-based */
  page?: number
  size?: number
}
