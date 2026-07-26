import dayjs from 'dayjs'
import type { Reservation, ReservationStatus } from '@/features/client/types'

/**
 * Agrupación visual de reservas del prototipo (tabs y badges).
 * La API solo conoce PENDIENTE | CONFIRMADA | CANCELADA; "Finalizada"
 * es una vista derivada: reserva activa cuya estancia ya terminó.
 */
export type ReservationUiStatus = 'ACTIVA' | 'FINALIZADA' | 'CANCELADA'

export function getUiStatus(reservation: Reservation): ReservationUiStatus {
  if (reservation.status === 'CANCELADA') return 'CANCELADA'
  return dayjs(reservation.check_out).isBefore(dayjs(), 'day')
    ? 'FINALIZADA'
    : 'ACTIVA'
}

export const UI_STATUS_LABEL: Record<ReservationUiStatus, string> = {
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
}

/** Iniciales para el avatar: 'Alejandro' + 'Morales' → 'AM'. */
export function getInitials(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
