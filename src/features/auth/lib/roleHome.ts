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
    case 'RECEPCIONISTA':
      return '/panel-reception'
    default:
      return '/panel-reception'
  }
}

/**
 * Valida si una ruta es accesible para un rol dado.
 * Previene que el state.from de un usuario anterior dirija a un nuevo usuario
 * a una ruta para la que no tiene permisos.
 */
export function isRouteAccessibleForRole(path: string, role: UserRole): boolean {
  // Rutas públicas siempre son accesibles
  if (path === '/' || path.startsWith('/disponibilidad') || path.startsWith('/login') || path.startsWith('/registro')) {
    return true
  }

  // Rutas del panel de cliente
  if (path.startsWith('/panel') && !path.startsWith('/panel-')) {
    return role === 'CLIENTE'
  }

  // Rutas del panel de recepción
  if (path.startsWith('/panel-reception')) {
    return role === 'RECEPCIONISTA' || role === 'ADMINISTRADOR'
  }

  // Rutas del panel de administración
  if (path.startsWith('/panel-admin')) {
    return role === 'ADMINISTRADOR'
  }

  // Por defecto, no accesible
  return false
}
