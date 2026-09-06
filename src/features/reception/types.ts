import type { Reservation, ReservationStatus } from '@/features/client/types'
import type { RoomStatus } from '@/features/rooms/types'

/** Métricas de ocupación del panel (GET /panel-reception/occupancy). */
export interface Occupancy {
  occupied: number
  available: number
  maintenance: number
  total: number
}

/** Reservas de hoy (GET /reservations/today). */
export interface TodayReservations {
  check_ins: Reservation[]
  check_outs: Reservation[]
}

// La paginación es común a los listados del panel interno.
export type { PageResponse } from '@/shared/api/types'

/** Filtros de la tabla global de reservas (GET /reservations). */
export interface ReservationQuery {
  search?: string
  /** YYYY-MM-DD */
  from?: string
  /** YYYY-MM-DD */
  to?: string
  status?: ReservationStatus
  /** 0-based */
  page?: number
  size?: number
}

/** Datos del huésped para una reserva manual (HU-020). */
export interface ManualGuest {
  name: string
  last_name: string
  email: string
  phone?: string
}

/** POST /reservations/manual. */
export interface ManualReservationRequest {
  room_id: number
  check_in: string
  check_out: string
  guests: number
  guest: ManualGuest
}

/** POST/PUT /rooms — alta y edición de habitación (HU-025/026). */
export interface RoomRequest {
  slug: string
  room_number: string
  name: string
  description: string
  capacity: number
  area: number
  beds_label: string
  price_per_night: number
  smoking_policy: string
  status?: RoomStatus
  images: string[]
  amenities: string[]
  bathroom: string[]
  views: string[]
}
