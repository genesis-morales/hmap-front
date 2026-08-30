import type { ReservationStatus, ReservationType } from '@/features/client/types'

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

/** Etiqueta legible por estado (visión de recepción). */
export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CHECK_IN: 'En estancia',
  CHECK_OUT: 'Completada',
  CANCELADA: 'Cancelada',
}

/** Tono de la píldora (StatusTag) por estado. */
export const RESERVATION_STATUS_TONE: Record<ReservationStatus, Tone> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'success',
  CHECK_IN: 'info',
  CHECK_OUT: 'neutral',
  CANCELADA: 'danger',
}

/** Color del punto del calendario por estado (leyenda del prototipo). */
export const RESERVATION_STATUS_DOT: Record<ReservationStatus, string> = {
  PENDIENTE: '#d98b2b',
  CONFIRMADA: '#2f855a',
  CHECK_IN: '#2b6f7d',
  CHECK_OUT: '#8a8578',
  CANCELADA: '#c0392b',
}

/** Estados que la tabla global ofrece como filtro (excluye los operativos). */
export const FILTERABLE_STATUSES: ReservationStatus[] = [
  'CONFIRMADA',
  'PENDIENTE',
  'CANCELADA',
]

// --- Origen de la reserva (campo `type`) ---

/** Etiqueta legible del origen. */
export const RESERVATION_TYPE_LABEL: Record<ReservationType, string> = {
  ONLINE: 'En línea',
  MANUAL: 'Manual',
}

/** Tono de la píldora por origen. */
export const RESERVATION_TYPE_TONE: Record<ReservationType, Tone> = {
  ONLINE: 'info',
  MANUAL: 'neutral',
}
