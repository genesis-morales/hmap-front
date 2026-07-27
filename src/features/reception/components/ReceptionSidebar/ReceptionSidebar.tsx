import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarOutlined,
  HomeOutlined,
  LogoutOutlined,
  ProfileOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { Brand } from '@/shared/components/Brand/Brand'
import { BedIcon } from '@/shared/components/icons/BedIcon'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getInitials } from '@/features/client/lib/reservationUi'
import './ReceptionSidebar.scss'

const NAV_ITEMS = [
  {
    to: '/panel-reception',
    label: 'Inicio',
    icon: <HomeOutlined />,
    isActive: (p: string) => p === '/panel-reception',
  },
  {
    to: '/panel-reception/calendario',
    label: 'Calendario',
    icon: <CalendarOutlined />,
    isActive: (p: string) => p.startsWith('/panel-reception/calendario'),
  },
  {
    to: '/panel-reception/reservas',
    label: 'Reservas',
    icon: <ProfileOutlined />,
    isActive: (p: string) => p.startsWith('/panel-reception/reservas'),
  },
  {
    to: '/panel-reception/check-in-out',
    label: 'Check-in/out',
    icon: <SwapOutlined />,
    isActive: (p: string) => p.startsWith('/panel-reception/check-in-out'),
  },
  {
    to: '/panel-reception/habitaciones',
    label: 'Habitaciones',
    icon: <BedIcon />,
    isActive: (p: string) => p.startsWith('/panel-reception/habitaciones'),
  },
  {
    to: '/panel-reception/buscar',
    label: 'Buscar reserva',
    icon: <SearchOutlined />,
    isActive: (p: string) => p.startsWith('/panel-reception/buscar'),
  },
]

interface ReceptionSidebarProps {
  /** Cierra el drawer en móvil al navegar. */
  onNavigate?: () => void
}

/** Barra lateral del Panel de Recepcionista (prototipos E3). */
export function ReceptionSidebar({ onNavigate }: ReceptionSidebarProps) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    onNavigate?.()
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="reception-sidebar">
      <div className="reception-sidebar__brand">
        <Brand layout="vertical" size={56} />
        <span className="reception-sidebar__brand-caption">Reception Desk</span>
      </div>

      <nav className="reception-sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`reception-sidebar__link ${
              item.isActive(pathname) ? 'reception-sidebar__link--active' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="reception-sidebar__footer">
        {user && (
          <div className="reception-sidebar__user">
            <span className="reception-sidebar__avatar">
              {getInitials(user.name, user.last_name)}
            </span>
            <span className="reception-sidebar__user-info">
              <strong>
                {user.name} {user.last_name.charAt(0)}.
              </strong>
              <span className="reception-sidebar__user-role">Recepción</span>
            </span>
          </div>
        )}

        <button className="reception-sidebar__logout" onClick={handleLogout}>
          <LogoutOutlined />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
