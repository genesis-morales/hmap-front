/** Estados operativos de una habitación (el CRUD llega en E3). */
export type RoomStatus = 'DISPONIBLE' | 'OCUPADA' | 'MANTENIMIENTO'

/** Habitación tal como la sirve la API (contrato E2, snake_case). */
export interface Room {
  id: number
  /** Identificador legible para URLs, p. ej. 'deluxe-cama-grande'. */
  slug: string
  /** Número de habitación (llave natural, única), p. ej. '101', 'A-3'. */
  room_number: string
  name: string
  description: string
  capacity: number
  /** Superficie en m². */
  area: number
  /** Descripción de camas: '2 camas dobles'. */
  beds_label: string
  /** Precio por noche en USD. */
  price_per_night: number
  images: string[]
  amenities: string[]
  bathroom: string[]
  views: string[]
  smoking_policy: string
  status: RoomStatus
}

/** Parámetros de consulta de disponibilidad (HU-008). */
export interface StaySearch {
  /** YYYY-MM-DD */
  check_in: string
  /** YYYY-MM-DD */
  check_out: string
  guests: number
}
