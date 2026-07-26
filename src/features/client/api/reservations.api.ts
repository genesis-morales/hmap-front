import { apiClient } from '@/shared/api/client'
import type {
  CreateReservationRequest,
  Reservation,
  UpdateReservationRequest,
} from '@/features/client/types'

/** Reservas del cliente autenticado (HU-009 → HU-013). Requieren JWT. */
export const reservationsApi = {
  /** Crea la reserva (nace PENDIENTE). 409 si el rango se ocupó. */
  create(payload: CreateReservationRequest) {
    return apiClient.post<Reservation>('/reservations', payload).then((r) => r.data)
  },

  /** Mis reservas, más recientes primero. */
  listMine() {
    return apiClient.get<Reservation[]>('/reservations/me').then((r) => r.data)
  },

  /** Detalle (solo propia; 403 si es ajena). */
  get(id: number | string) {
    return apiClient.get<Reservation>(`/reservations/${id}`).then((r) => r.data)
  },

  /** Edita fechas/personas dentro de la ventana (409 fuera de ella). */
  update(id: number | string, payload: UpdateReservationRequest) {
    return apiClient.put<Reservation>(`/reservations/${id}`, payload).then((r) => r.data)
  },

  /** Cancela dentro de la ventana; la API envía el correo (HU-036). */
  cancel(id: number | string) {
    return apiClient.post<Reservation>(`/reservations/${id}/cancel`).then((r) => r.data)
  },
}
