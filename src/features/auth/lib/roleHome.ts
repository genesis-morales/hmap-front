import type { UserRole } from '@/features/auth/types'

/**
 * Ruta de inicio por rol tras autenticarse: el administrador entra a su panel,
 * el recepcionista al Panel de Recepción y el cliente a su portal.
 * La ruta previa (`from`, RNF-006) tiene prioridad sobre esto.
 */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case 'CLIENTE':
      return '/panel'
    case 'ADMINISTRADOR':
      return '/panel-admin'
    default:
      return '/panel-reception'
  }
}
