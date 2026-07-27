import { Input } from 'antd'
import { MenuOutlined, SearchOutlined } from '@ant-design/icons'
import { Brand } from '@/shared/components/Brand/Brand'
import './PanelTopbar.scss'

interface PanelTopbarProps {
  /** Título del panel (p. ej. "Panel de Recepción", "Panel Administrativo"). */
  title: string
  /** Placeholder del campo de búsqueda. */
  searchPlaceholder?: string
  /** Callback al presionar Enter en el buscador. */
  onSearch?: (term: string) => void
  /** Abre el menú lateral en móvil. */
  onMenuOpen?: () => void
}

/**
 * Barra superior reutilizable para paneles internos (recepción, admin).
 * Incluye: hamburguesa (móvil), brand (móvil), título (escritorio) y buscador.
 */
export function PanelTopbar({
  title,
  searchPlaceholder = 'Buscar...',
  onSearch,
  onMenuOpen,
}: PanelTopbarProps) {
  return (
    <header className="panel-topbar">
      <button
        className="panel-topbar__burger"
        aria-label="Abrir menú"
        onClick={onMenuOpen}
      >
        <MenuOutlined />
      </button>

      <div className="panel-topbar__brand-mobile">
        <Brand size={32} />
      </div>

      <h1 className="panel-topbar__title">{title}</h1>

      {onSearch && (
        <Input
          className="panel-topbar__search"
          size="large"
          allowClear
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          onPressEnter={(e) => onSearch((e.target as HTMLInputElement).value.trim())}
        />
      )}
    </header>
  )
}
