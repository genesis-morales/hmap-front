import {
  TeamOutlined,
  DesktopOutlined,
} from '@ant-design/icons'
import { PanelLayout } from '@/shared/layouts/PanelLayout/PanelLayout'
import type { NavItem } from '@/shared/layouts/PanelLayout/PanelSidebar'

const NAV_ITEMS: NavItem[] = [
  {
    to: '/panel-admin/usuarios',
    label: 'Usuarios',
    icon: <TeamOutlined />,
    isActive: (p) => p.startsWith('/panel-admin/usuarios'),
  },
  {
    to: '/panel-reception',
    label: 'Panel de recepción',
    icon: <DesktopOutlined />,
    isActive: (p) => p.startsWith('/panel-reception'),
  },
]

/**
 * Layout del Panel de Administrador: usa `PanelLayout` compartido.
 * Sin buscador en la topbar (a diferencia de recepción).
 */
export function AdminLayout() {
  return (
    <PanelLayout
      navItems={NAV_ITEMS}
      brandCaption="Administración"
      roleLabel="Admin"
    />
  )
}
