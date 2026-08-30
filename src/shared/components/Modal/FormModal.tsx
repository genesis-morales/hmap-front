import type { ReactNode } from 'react'
import { Button, Modal } from 'antd'
import './Modal.scss'

export interface FormModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  width?: number
  /** Texto del botón de guardado. */
  submitText: string
  cancelText?: string
  /** Dispara el submit del Form de antd (form.submit()). */
  onSubmit: () => void
  /** Estado de guardado, controlado por la página. */
  saving?: boolean
  children: ReactNode
}

/**
 * Contenedor para modales con formulario.
 * El estado del Form vive en el llamador; aquí solo se unifica el chrome.
 */
export function FormModal({
  open,
  onClose,
  title,
  description,
  width = 560,
  submitText,
  cancelText = 'Cancelar',
  onSubmit,
  saving = false,
  children,
}: FormModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={width}
      destroyOnHidden
      title={title}
    >
      <div className="hmap-modal hmap-modal--inline hmap-modal--info">
        {description && <p className="hmap-modal__description">{description}</p>}
        {children}
        <div className="hmap-modal__footer">
          <Button type="text" onClick={onClose} disabled={saving}>
            {cancelText}
          </Button>
          <Button
            type="primary"
            className="btn-forest"
            loading={saving}
            onClick={onSubmit}
          >
            {submitText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
