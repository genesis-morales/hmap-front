import { useNavigate } from 'react-router-dom'
import {
  CalendarOutlined,
  HomeOutlined,
  ProfileOutlined,
  SearchOutlined,
  SwapOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { BedIcon } from '@/shared/components/icons/BedIcon'
import { PanelLayout } from '@/shared/layouts/PanelLayout/PanelLayout'
import type { NavItem } from '@/shared/layouts/PanelLayout/PanelSidebar'

const NAV_ITEMS: NavItem[] = [
  {
    to: '/panel-reception',
    label: 'Inicio',
    icon: <HomeOutlined />,
    isActive: (p) => p === '/panel-reception',
  },
  {
    to: '/panel-reception/calendario',
    label: 'Calendario',
    icon: <CalendarOutlined />,
    isActive: (p) => p.startsWith('/panel-reception/calendario'),
  },
  {
    to: '/panel-reception/reservas',
    label: 'Reservas',
    icon: <ProfileOutlined />,
    isActive: (p) => p.startsWith('/panel-reception/reservas'),
  },
  {
    to: '/panel-reception/check-in-out',
    label: 'Check-in/out',
    icon: <SwapOutlined />,
    isActive: (p) => p.startsWith('/panel-reception/check-in-out'),
  },
  {
    to: '/panel-reception/habitaciones',
    label: 'Habitaciones',
    icon: <BedIcon />,
    isActive: (p) => p.startsWith('/panel-reception/habitaciones'),
  },
  {
    to: '/panel-reception/buscar',
    label: 'Buscar reserva',
    icon: <SearchOutlined />,
    isActive: (p) => p.startsWith('/panel-reception/buscar'),
  },
  {
    to: '/panel-admin/usuarios',
    label: 'Administración',
    icon: <SettingOutlined />,
    isActive: (p) => p.startsWith('/panel-admin'),
    visible: (role) => role === 'ADMINISTRADOR',
  },
]

/**
 * Layout del Panel de Recepcionista: migrado a `PanelLayout` compartido.
 * Sidebar fija en escritorio, barra superior con búsqueda global y drawer en móvil.
 */
export function ReceptionLayout() {
  const navigate = useNavigate()

  const search = (term: string) => {
    navigate(
      term
        ? `/panel-reception/buscar?q=${encodeURIComponent(term)}`
        : '/panel-reception/buscar',
    )
  }

  return (
    <PanelLayout
      navItems={NAV_ITEMS}
      brandCaption="Reception Desk"
      roleLabel="Recepción"
      searchPlaceholder="Buscar clientes, reservas..."
      onSearch={search}
    />
  )
}
