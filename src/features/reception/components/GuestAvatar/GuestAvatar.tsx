import { getInitials } from '@/features/client/lib/reservationUi'
import './GuestAvatar.scss'

/** Paleta suave; el color se elige de forma estable a partir del nombre. */
const PALETTE = [
  { bg: '#d8efe1', fg: '#2f855a' },
  { bg: '#fbe1dc', fg: '#c0503a' },
  { bg: '#e2eef1', fg: '#2b6f7d' },
  { bg: '#f3e6cf', fg: '#a9791f' },
  { bg: '#e7e2f2', fg: '#5b4b8a' },
]

interface GuestAvatarProps {
  name: string
  lastName: string
  size?: number
}

/** Círculo con iniciales del huésped (tablas y listados del panel). */
export function GuestAvatar({ name, lastName, size = 40 }: GuestAvatarProps) {
  const seed = `${name}${lastName}`
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const color = PALETTE[hash % PALETTE.length]

  return (
    <span
      className="guest-avatar"
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.fg,
        fontSize: size * 0.36,
      }}
    >
      {getInitials(name, lastName)}
    </span>
  )
}
