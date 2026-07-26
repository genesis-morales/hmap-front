import type { Room } from '@/features/rooms/types'

/** Estados de reserva del E2 (E3 agrega CHECK_IN | CHECK_OUT). */
export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'

/** Reserva tal como la sirve la API (contrato E2, snake_case). */
export interface Reservation {
  id: number
  /** Identificador legible, p. ej. 'RSV-000123'. */
  code: string
  /** Habitación anidada para no pedirla aparte. */
  room: Room
  /** YYYY-MM-DD */
  check_in: string
  /** YYYY-MM-DD */
  check_out: string
  guests: number
  nights: number
  /** nights × price_per_night, calculado y persistido por la API. */
  total: number
  status: ReservationStatus
  /** La API aplica la política de plazos (HU-012); el FE solo refleja el flag. */
  can_edit: boolean
  /** Ídem (HU-013). */
  can_cancel: boolean
  /** ISO 8601 */
  created_at: string
}

// --- Payloads de request ---
export interface CreateReservationRequest {
  room_id: number
  check_in: string
  check_out: string
  guests: number
}

export interface UpdateReservationRequest {
  check_in: string
  check_out: string
  guests: number
}

export interface UpdateProfileRequest {
  name: string
  last_name: string
  phone?: string | null
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
