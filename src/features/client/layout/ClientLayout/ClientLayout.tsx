import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Drawer } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { Brand } from '@/shared/components/Brand/Brand'
import { ClientSidebar } from '@/features/client/components/ClientSidebar/ClientSidebar'
import './ClientLayout.scss'

/**
 * Layout del panel del cliente: sidebar fija en escritorio,
 * barra superior con drawer en móvil (RNF-003).
 */
export function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="client-layout">
      <aside className="client-layout__sidebar">
        <ClientSidebar />
      </aside>

      <header className="client-layout__topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="client-layout__burger"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(true)}
          >
            <MenuOutlined />
          </button>
          <Brand size={36} />
        </div>
      </header>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="left"
        width={280}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <ClientSidebar onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <main className="client-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
