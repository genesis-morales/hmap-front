import type { RoomStatus } from '@/features/rooms/types'

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  MANTENIMIENTO: 'Mantenimiento',
}

export const ROOM_STATUS_TONE: Record<RoomStatus, Tone> = {
  DISPONIBLE: 'success',
  OCUPADA: 'danger',
  MANTENIMIENTO: 'warning',
}

export const ROOM_STATUSES: RoomStatus[] = [
  'DISPONIBLE',
  'OCUPADA',
  'MANTENIMIENTO',
]
