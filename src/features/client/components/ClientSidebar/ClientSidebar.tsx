import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRightOutlined,
  CalendarOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Brand } from '@/shared/components/Brand/Brand'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getInitials } from '@/features/client/lib/reservationUi'
import './ClientSidebar.scss'

const NAV_ITEMS = [
  {
    to: '/panel',
    label: 'Inicio',
    icon: <HomeOutlined />,
    // La búsqueda y la confirmación nacen en Inicio.
    isActive: (path: string) =>
      path === '/panel' ||
      path.startsWith('/panel/disponibilidad') ||
      path.startsWith('/panel/confirmar'),
  },
  {
    to: '/panel/reservas',
    label: 'Mis reservas',
    icon: <CalendarOutlined />,
    isActive: (path: string) => path.startsWith('/panel/reservas'),
  },
  {
    to: '/panel/perfil',
    label: 'Mi perfil',
    icon: <UserOutlined />,
    isActive: (path: string) => path.startsWith('/panel/perfil'),
  },
]

interface ClientSidebarProps {
  /** Cierra el drawer en móvil al navegar. */
  onNavigate?: () => void
}

/** Barra lateral del portal del cliente (prototipos E2). */
export function ClientSidebar({ onNavigate }: ClientSidebarProps) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    onNavigate?.()
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="client-sidebar">
      <div className="client-sidebar__brand">
        <Brand layout="vertical" size={56} />
        <span className="client-sidebar__brand-caption">Portal del Cliente</span>
      </div>

      <nav className="client-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`client-sidebar__link ${
              item.isActive(pathname) ? 'client-sidebar__link--active' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="client-sidebar__footer">
        {user && (
          <Link
            to="/panel/perfil"
            onClick={onNavigate}
            className="client-sidebar__user"
          >
            <span className="client-sidebar__avatar">
              {getInitials(user.name, user.last_name)}
            </span>
            <span className="client-sidebar__user-info">
              <strong>
                {user.name} {user.last_name.charAt(0)}.
              </strong>
              <span className="client-sidebar__user-link">
                Ver mi perfil <ArrowRightOutlined />
              </span>
            </span>
          </Link>
        )}

        <button className="client-sidebar__logout" onClick={handleLogout}>
          <LogoutOutlined />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
