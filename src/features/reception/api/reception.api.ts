import { apiClient } from '@/shared/api/client'
import type { Reservation } from '@/features/client/types'
import type {
  ManualReservationRequest,
  Occupancy,
  PageResponse,
  ReservationQuery,
  TodayReservations,
} from '@/features/reception/types'

/**
 * API del Panel de Recepcionista (E3). Todas requieren rol
 * RECEPCIONISTA o ADMINISTRADOR (la autorización real la aplica la API).
 */
export const receptionApi = {
  /** Métricas de ocupación en tiempo real (HU-016). */
  occupancy() {
    return apiClient
      .get<Occupancy>('/panel-reception/occupancy')
      .then((r) => r.data)
  },

  /** Check-ins y check-outs programados para hoy (HU-018). */
  today() {
    return apiClient
      .get<TodayReservations>('/reservations/today')
      .then((r) => r.data)
  },

  /** Reservas que solapan el rango [from, to] para el calendario (HU-017). */
  calendar(from: string, to: string) {
    return apiClient
      .get<Reservation[]>('/reservations/calendar', { params: { from, to } })
      .then((r) => r.data)
  },

  /** Tabla global de reservas, paginada y filtrable (HU-023/024). */
  listReservations(query: ReservationQuery = {}) {
    return apiClient
      .get<PageResponse<Reservation>>('/reservations', { params: query })
      .then((r) => r.data)
  },

  /** Crea una reserva a nombre de un huésped (HU-020); dispara correo HU-037. */
  createManual(payload: ManualReservationRequest) {
    return apiClient
      .post<Reservation>('/reservations/manual', payload)
      .then((r) => r.data)
  },

  /** PENDIENTE → CONFIRMADA (409 si no está pendiente). */
  confirm(id: number) {
    return apiClient
      .post<Reservation>(`/reservations/${id}/confirm`)
      .then((r) => r.data)
  },

  /** CONFIRMADA → CHECK_IN; habitación → OCUPADA (HU-019). */
  checkIn(id: number) {
    return apiClient
      .post<Reservation>(`/reservations/${id}/check-in`)
      .then((r) => r.data)
  },

  /** CHECK_IN → CHECK_OUT; habitación → DISPONIBLE (HU-019). */
  checkOut(id: number) {
    return apiClient
      .post<Reservation>(`/reservations/${id}/check-out`)
      .then((r) => r.data)
  },

  /** Cancela desde recepción con motivo obligatorio (HU-022). */
  cancel(id: number, reason: string) {
    return apiClient
      .post<Reservation>(`/reservations/${id}/cancel`, { reason })
      .then((r) => r.data)
  },
}
