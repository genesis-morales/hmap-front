import dayjs, { type Dayjs } from 'dayjs'

/** Formato de fecha del contrato de API (fechas de estancia). */
export const API_DATE_FORMAT = 'YYYY-MM-DD'

/** Noches entre dos fechas YYYY-MM-DD. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  return dayjs(checkOut).diff(dayjs(checkIn), 'day')
}

/** '2026-06-12' → '12 Jun 2026' (locale es, mes capitalizado). */
export function formatStayDate(date: string | Dayjs): string {
  const formatted = dayjs(date).format('D MMM YYYY')
  return formatted.replace(/ ([a-záéíóú])/, (m) => m.toUpperCase())
}

/** Rango legible: '12 Jun 2026 → 18 Jun 2026'. */
export function formatStayRange(checkIn: string, checkOut: string): string {
  return `${formatStayDate(checkIn)} → ${formatStayDate(checkOut)}`
}

/** Monto USD estilo prototipo: 1080 → '$1,080'. */
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

/** Etiqueta de noches: 1 → '1 noche'. */
export function nightsLabel(nights: number): string {
  return `${nights} ${nights === 1 ? 'noche' : 'noches'}`
}
