import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { Brand } from '@/shared/components/Brand/Brand'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getInitials } from '@/shared/lib/initials'
import type { UserRole } from '@/features/auth/types'
import './PanelSidebar.scss'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  /** Determina si el item está activo dada la ruta actual. */
  isActive?: (pathname: string) => boolean
  /** Si retorna false, el item no se muestra (para rol). */
  visible?: (role: UserRole) => boolean
}

interface PanelSidebarProps {
  /** Items de navegación del panel. */
  navItems: NavItem[]
  /** Caption bajo el logo (p. ej. "Reception Desk", "Administración"). */
  brandCaption: string
  /** Etiqueta del rol en el footer (p. ej. "Recepción", "Admin"). */
  roleLabel: string
  /** Cierra el drawer en móvil al navegar o al logout. */
  onNavigate?: () => void
}

/**
 * Barra lateral compartida por los paneles internos (recepción, admin).
 * Consolidada desde `ReceptionSidebar` y el footer de `ClientSidebar`.
 */
export function PanelSidebar({
  navItems,
  brandCaption,
  roleLabel,
  onNavigate,
}: PanelSidebarProps) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const handleLogout = () => {
    onNavigate?.()
    logout()
    // La navegación a "/" la hace el componente que usa este sidebar.
  }

  const visibleItems = user
    ? navItems.filter((item) => !item.visible || item.visible(user.role))
    : navItems

  return (
    <div className="panel-sidebar">
      <div className="panel-sidebar__brand">
        <Brand layout="vertical" size={56} />
        <span className="panel-sidebar__brand-caption">{brandCaption}</span>
      </div>

      <nav className="panel-sidebar__nav">
        {visibleItems.map((item) => {
          const active = item.isActive ? item.isActive(pathname) : pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`panel-sidebar__link ${
                active ? 'panel-sidebar__link--active' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="panel-sidebar__footer">
        {user && (
          <div className="panel-sidebar__user">
            <span className="panel-sidebar__avatar">
              {getInitials(user.name, user.last_name)}
            </span>
            <span className="panel-sidebar__user-info">
              <strong>
                {user.name} {user.last_name.charAt(0)}.
              </strong>
              <span className="panel-sidebar__user-role">{roleLabel}</span>
            </span>
          </div>
        )}

        <button className="panel-sidebar__logout" onClick={handleLogout}>
          <LogoutOutlined />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
