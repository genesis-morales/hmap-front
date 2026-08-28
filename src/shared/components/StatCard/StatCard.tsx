import type { ReactNode } from 'react'
import './StatCard.scss'

export type StatTone = 'neutral' | 'success' | 'danger' | 'warning'

interface StatCardProps {
  label: string
  value: ReactNode
  /** Ícono opcional junto al valor o en un recuadro (variante 'boxed'). */
  icon?: ReactNode
  tone?: StatTone
  /** 'accent' pinta un borde lateral; 'boxed' pone el ícono en recuadro. */
  variant?: 'accent' | 'boxed'
}

/** Tarjeta de métrica del panel (ocupación, conteos por estado). */
export function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
  variant = 'accent',
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone} stat-card--${variant}`}>
      {variant === 'boxed' && icon && (
        <span className="stat-card__icon-box">{icon}</span>
      )}
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">
          {value}
          {variant === 'accent' && icon && (
            <span className="stat-card__icon">{icon}</span>
          )}
        </span>
      </div>
    </div>
  )
}
