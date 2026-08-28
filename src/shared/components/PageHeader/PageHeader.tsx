import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'

interface Crumb {
  label: string
  /** Si tiene ruta, se renderiza como enlace. */
  to?: string
}

interface PageHeaderProps {
  title: string
  /** Migajas de pan; la última es la sección actual. */
  breadcrumb?: Crumb[]
  subtitle?: ReactNode
  /** Acciones alineadas a la derecha (p. ej. botón "Nueva reserva"). */
  actions?: ReactNode
}

/** Encabezado uniforme de todas las secciones del panel de recepción. */
export function PageHeader({ title, breadcrumb, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="page-header__breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label} className="page-header__crumb">
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span className="page-header__crumb--current">{crumb.label}</span>
                )}
                {i < breadcrumb.length - 1 && (
                  <span className="page-header__sep">›</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}
