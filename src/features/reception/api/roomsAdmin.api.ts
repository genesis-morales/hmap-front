import { apiClient } from '@/shared/api/client'
import type { Room, RoomStatus } from '@/features/rooms/types'
import type { RoomRequest } from '@/features/reception/types'

/** Inventario de habitaciones — rol interno (HU-025 → HU-028). */
export const roomsAdminApi = {
  /** Crea una habitación (409 si el slug está duplicado). */
  create(payload: RoomRequest) {
    return apiClient.post<Room>('/rooms', payload).then((r) => r.data)
  },

  /** Edita una habitación existente. */
  update(id: number, payload: RoomRequest) {
    return apiClient.put<Room>(`/rooms/${id}`, payload).then((r) => r.data)
  },

  /** Elimina una habitación (409 si tiene reservas activas). */
  remove(id: number) {
    return apiClient.delete<void>(`/rooms/${id}`).then((r) => r.data)
  },

  /** Cambia el estado operativo de la habitación (HU-028). */
  setStatus(id: number, status: RoomStatus) {
    return apiClient
      .patch<Room>(`/rooms/${id}/status`, { status })
      .then((r) => r.data)
  },
}
