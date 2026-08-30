import type { Room } from '@/features/rooms/types'

/**
 * Estados de reserva. E2 definió PENDIENTE/CONFIRMADA/CANCELADA;
 * E3 agrega los operativos CHECK_IN (huésped en estancia) y CHECK_OUT (salida registrada).
 */
export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'CANCELADA'

/**
 * Origen de la reserva: ONLINE la creó el cliente desde el portal público
 * (HU-009); MANUAL la creó un recepcionista o admin desde el panel (HU-020).
 */
export type ReservationType = 'ONLINE' | 'MANUAL'

/** Titular de la reserva (añadido en E3: la recepción ve a quién pertenece). */
export interface Guest {
  id: number
  name: string
  last_name: string
  email: string
  phone?: string | null
}

/** Reserva tal como la sirve la API (contrato E2/E3, snake_case). */
export interface Reservation {
  id: number
  /** Identificador legible, p. ej. 'RSV-000123'. */
  code: string
  /** Titular de la reserva (E3). */
  guest: Guest
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
  /** Origen de la reserva (portal público vs panel interno). */
  type: ReservationType
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
