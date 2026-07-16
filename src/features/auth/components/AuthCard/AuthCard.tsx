import type { ReactNode } from 'react'
import { hotel } from '@/shared/config/hotel'
import logo from '@/assets/logo/logo.png'
import './AuthCard.scss'

interface AuthCardProps {
  children: ReactNode
  /** Encabezado personalizado (por defecto: logo + nombre del hotel). */
  header?: ReactNode
}

/** Tarjeta contenedora de los formularios de autenticación. */
export function AuthCard({ children, header }: AuthCardProps) {
  return (
    <div className="auth-card">
      <div className="auth-card__body">
        {header ?? (
          <div className="auth-card__brand">
            <img src={logo} alt="" className="auth-card__logo" />
            <h1 className="auth-card__title">{hotel.name}</h1>
          </div>
        )}
        {children}
      </div>
      <div className="auth-card__strip">Naturaleza • Comodidad</div>
    </div>
  )
}
