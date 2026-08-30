import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Drawer } from 'antd'
import { PanelTopbar } from '@/shared/components/PanelTopbar/PanelTopbar'
import { PanelSidebar, type NavItem } from './PanelSidebar'
import './PanelLayout.scss'

interface PanelLayoutProps {
  /** Items de navegación del sidebar. */
  navItems: NavItem[]
  /** Caption bajo el logo en el sidebar. */
  brandCaption: string
  /** Etiqueta del rol en el footer del sidebar. */
  roleLabel: string
  /** Placeholder del buscador de la topbar (opcional). */
  searchPlaceholder?: string
  /** Callback del buscador (si está presente). */
  onSearch?: (term: string) => void
}

/**
 * Layout compartido para los paneles internos (recepción, admin).
 * Sidebar fija en escritorio, topbar con búsqueda + drawer en móvil.
 */
export function PanelLayout({
  navItems,
  brandCaption,
  roleLabel,
  searchPlaceholder,
  onSearch,
}: PanelLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (term: string) => {
    if (onSearch) {
      onSearch(term)
    }
  }

  const handleLogout = () => {
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="panel-layout">
      <aside className="panel-layout__sidebar">
        <PanelSidebar
          navItems={navItems}
          brandCaption={brandCaption}
          roleLabel={roleLabel}
          onNavigate={handleLogout}
        />
      </aside>

      <PanelTopbar
        searchPlaceholder={searchPlaceholder}
        onSearch={searchPlaceholder ? handleSearch : undefined}
        onMenuOpen={() => setMenuOpen(true)}
      />

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="left"
        width={280}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <PanelSidebar
          navItems={navItems}
          brandCaption={brandCaption}
          roleLabel={roleLabel}
          onNavigate={() => {
            setMenuOpen(false)
            // El logout real lo ejecuta PanelSidebar.
          }}
        />
      </Drawer>

      <main className="panel-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
