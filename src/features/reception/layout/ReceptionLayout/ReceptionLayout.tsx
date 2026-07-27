import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Drawer } from 'antd'
import { PanelTopbar } from '@/shared/components/PanelTopbar/PanelTopbar'
import { ReceptionSidebar } from '@/features/reception/components/ReceptionSidebar/ReceptionSidebar'
import './ReceptionLayout.scss'

/**
 * Layout del Panel de Recepcionista: sidebar fija en escritorio,
 * barra superior con búsqueda global y drawer en móvil (RNF-003).
 */
export function ReceptionLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const search = (term: string) => {
    navigate(
      term
        ? `/panel-reception/buscar?q=${encodeURIComponent(term)}`
        : '/panel-reception/buscar',
    )
  }

  return (
    <div className="reception-layout">
      <aside className="reception-layout__sidebar">
        <ReceptionSidebar />
      </aside>

      <PanelTopbar
        title="Panel de Recepción"
        searchPlaceholder="Buscar huéspedes, reservas..."
        onSearch={search}
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
        <ReceptionSidebar onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <main className="reception-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
