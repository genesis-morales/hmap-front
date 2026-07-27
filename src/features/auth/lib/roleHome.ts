import type { UserRole } from '@/features/auth/types'

/**
 * Ruta de inicio por rol tras autenticarse. El personal interno
 * (recepcionista/administrador) entra al Panel de Recepción; el cliente,
 * a su portal. La ruta previa (`from`, RNF-006) tiene prioridad sobre esto.
 */
export function homePathForRole(role: UserRole): string {
  return role === 'CLIENTE' ? '/panel' : '/panel-reception'
}
