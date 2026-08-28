import type { UserRole } from '@/features/auth/types'

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

/** Etiquetas de rol para la UI del panel admin. */
export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  CLIENTE: 'Cliente',
}

/** Tonos de rol para las píldoras StatusTag. */
export const USER_ROLE_TONE: Record<UserRole, Tone> = {
  ADMINISTRADOR: 'danger',
  RECEPCIONISTA: 'info',
  CLIENTE: 'neutral',
}

/** Etiqueta del estado activo/suspendido. */
export const USER_ACTIVE_LABEL: Record<string, string> = {
  true: 'Activo',
  false: 'Inactivo',
}

/** Tono del estado activo/suspendido. */
export const USER_ACTIVE_TONE: Record<string, Tone> = {
  true: 'success',
  false: 'neutral',
}
