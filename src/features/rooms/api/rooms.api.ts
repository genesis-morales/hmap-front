import { apiClient } from '@/shared/api/client'
import type { Room, StaySearch } from '@/features/rooms/types'

/** Habitaciones — lectura pública (no requiere sesión). */
export const roomsApi = {
  /** Catálogo completo. Lo consumen el portal público y el panel del cliente. */
  list() {
    return apiClient.get<Room[]>('/rooms').then((r) => r.data)
  },

  /** Detalle de una habitación. */
  get(id: number) {
    return apiClient.get<Room>(`/rooms/${id}`).then((r) => r.data)
  },

  /**
   * Habitaciones libres en el rango con capacidad ≥ guests (HU-008).
   * La API valida fechas (400 con mensaje en español) y ordena por precio.
   */
  availability(params: StaySearch) {
    return apiClient
      .get<Room[]>('/rooms/availability', { params })
      .then((r) => r.data)
  },
}
