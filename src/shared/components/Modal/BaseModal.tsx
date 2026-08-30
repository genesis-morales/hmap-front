import type { ReactNode } from 'react'
import { Modal } from 'antd'
import './Modal.scss'

export type ModalTone = 'danger' | 'warning' | 'success' | 'info'

export interface BaseModalProps {
  open: boolean
  onClose: () => void
  /** Título del modal. En layout "centered" se pinta dentro del cuerpo. */
  title: ReactNode
  /** Texto secundario bajo el título. */
  description?: ReactNode
  /** Icono circular; solo se muestra en layout "centered". */
  icon?: ReactNode
  /** Colorea el icono y los acentos. */
  tone?: ModalTone
  /**
   * "centered" → icono + título dentro del cuerpo, texto centrado (confirmaciones).
   * "inline"   → título en el header nativo de antd (formularios).
   */
  layout?: 'centered' | 'inline'
  width?: number
  /** Botonera propia. Si se omite, se usa el footer de antd vía footerProps. */
  footer?: ReactNode
  children?: ReactNode
}

/**
 * Contenedor común de todos los modales del sistema.
 * Fija ancho, tipografía y estructura para que las pantallas sean consistentes.
 */
export function BaseModal({
  open,
  onClose,
  title,
  description,
  icon,
  tone = 'info',
  layout = 'centered',
  width = 480,
  footer,
  children,
}: BaseModalProps) {
  const centered = layout === 'centered'

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={width}
      destroyOnHidden
      title={centered ? undefined : title}
    >
      <div className={`hmap-modal hmap-modal--${layout} hmap-modal--${tone}`}>
        {centered && icon && <span className="hmap-modal__icon">{icon}</span>}
        {centered && <h2 className="hmap-modal__title">{title}</h2>}
        {description && <p className="hmap-modal__description">{description}</p>}
        {children && <div className="hmap-modal__body">{children}</div>}
        {footer}
      </div>
    </Modal>
  )
}
