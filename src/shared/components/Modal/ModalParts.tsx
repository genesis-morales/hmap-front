import type { ReactNode } from 'react'
import './ModalParts.scss'

/** Card de resumen: bloque crema con filas etiqueta/valor. */
export function ModalSummary({
  heading,
  children,
}: {
  /** Título opcional de la card (nombre de habitación, usuario...). */
  heading?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="hmap-summary">
      {heading && <h3 className="hmap-summary__heading">{heading}</h3>}
      {children}
    </div>
  )
}

/** Fila etiqueta/valor dentro de una ModalSummary. */
export function ModalSummaryRow({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <div className="hmap-summary__row">
      <span className="hmap-summary__label">{label}</span>
      <span className="hmap-summary__value">{children}</span>
    </div>
  )
}

/** Fila destacada al pie de la card, para el código de reserva. */
export function ModalSummaryCode({
  label = 'Reserva',
  code,
}: {
  label?: string
  code: string
}) {
  return (
    <div className="hmap-summary__code">
      <span>{label}</span>
      <strong># {code}</strong>
    </div>
  )
}

export type NoteTone = 'info' | 'warning' | 'danger' | 'plain'

/** Nota o aviso con barra lateral de color según el tono. */
export function ModalNote({
  tone = 'info',
  icon,
  children,
}: {
  tone?: NoteTone
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <p className={`hmap-note hmap-note--${tone}`}>
      {icon}
      <span>{children}</span>
    </p>
  )
}
