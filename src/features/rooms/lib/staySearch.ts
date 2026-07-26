import dayjs from 'dayjs'
import { API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import type { StaySearch } from '@/features/rooms/types'

/**
 * La búsqueda de disponibilidad viaja en la query string
 * (?check_in=&check_out=&guests=). Así sobrevive al paso por login
 * (RNF-006): RequireAuth conserva la URL completa y el login regresa a ella.
 */

/** Serializa la búsqueda para navegar a /panel/disponibilidad. */
export function toSearchParams(search: StaySearch): string {
  return new URLSearchParams({
    check_in: search.check_in,
    check_out: search.check_out,
    guests: String(search.guests),
  }).toString()
}

/** Lee y valida la búsqueda desde la URL; null si falta o es inválida. */
export function fromSearchParams(params: URLSearchParams): StaySearch | null {
  const checkIn = params.get('check_in') ?? ''
  const checkOut = params.get('check_out') ?? ''
  const guests = Number(params.get('guests') ?? '')

  const inDate = dayjs(checkIn, API_DATE_FORMAT, true)
  const outDate = dayjs(checkOut, API_DATE_FORMAT, true)

  const valid =
    inDate.isValid() &&
    outDate.isValid() &&
    outDate.isAfter(inDate) &&
    Number.isInteger(guests) &&
    guests >= 1

  return valid ? { check_in: checkIn, check_out: checkOut, guests } : null
}
