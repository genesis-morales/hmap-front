import type { ReactNode } from 'react'
import './StatusTag.scss'

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

interface StatusTagProps {
  tone: StatusTone
  /** Punto de color a la izquierda (estilo "● ACTIVA" del prototipo). */
  dot?: boolean
  children: ReactNode
}

/** Píldora de estado de los prototipos (CONFIRMADA, CANCELADA, ...). */
export function StatusTag({ tone, dot = false, children }: StatusTagProps) {
  return (
    <span className={`status-tag status-tag--${tone}`}>
      {dot && <span className="status-tag__dot" />}
      {children}
    </span>
  )
}
