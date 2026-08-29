import { getInitials } from '@/shared/lib/initials'
import './UserAvatar.scss'

/** Paleta suave; el color se elige de forma estable a partir del nombre. */
const PALETTE = [
  { bg: '#d8efe1', fg: '#2f855a' },
  { bg: '#fbe1dc', fg: '#c0503a' },
  { bg: '#e2eef1', fg: '#2b6f7d' },
  { bg: '#f3e6cf', fg: '#a9791f' },
  { bg: '#e7e2f2', fg: '#5b4b8a' },
]

interface UserAvatarProps {
  name: string
  lastName: string
  size?: number
}

/**
 * Círculo con iniciales de una persona: huéspedes en las tablas de recepción,
 * usuarios en la nómina del panel admin.
 */
export function UserAvatar({ name, lastName, size = 40 }: UserAvatarProps) {
  const seed = `${name}${lastName}`
  const hash = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const color = PALETTE[hash % PALETTE.length]

  return (
    <span
      className="user-avatar"
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
