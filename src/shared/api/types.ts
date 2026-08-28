/**
 * Envoltorio de paginación de la API (snake_case). Lo devuelven todos los
 * listados paginados: reservas del panel de recepción y nómina de usuarios
 * del panel admin.
 */
export interface PageResponse<T> {
  content: T[]
  /** Página actual, 0-based. */
  page: number
  size: number
  total_elements: number
  total_pages: number
}
