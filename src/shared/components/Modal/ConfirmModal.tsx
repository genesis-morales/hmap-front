import { useState, type ReactNode } from 'react'
import { App, Button } from 'antd'
import { getErrorMessage } from '@/shared/api/client'
import { BaseModal, type ModalTone } from './BaseModal'

export interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  tone?: ModalTone
  width?: number
  /** Texto del botón de acción. */
  confirmText: string
  /** Texto del botón de descarte. */
  cancelText?: string
  /** Bloquea la confirmación (p. ej. checkbox de verificación sin marcar). */
  confirmDisabled?: boolean
  /** Botones en columna, ancho completo. Útil en confirmaciones destructivas. */
  stacked?: boolean
  /** Mensaje de éxito; si se omite no se notifica. */
  successMessage?: string
  /** Fallback cuando la API no envía mensaje. */
  errorMessage?: string
  /** Acción a ejecutar. Si lanza, el modal permanece abierto. */
  onConfirm: () => Promise<void> | void
  children?: ReactNode
}

/**
 * Modal de confirmación genérico: gestiona loading, éxito y error.
 * El llamador solo aporta el copy, el contenido y la promesa de la acción.
 */
export function ConfirmModal({
  open,
  onClose,
  title,
  description,
  icon,
  tone = 'danger',
  width,
  confirmText,
  cancelText = 'Cancelar',
  confirmDisabled = false,
  stacked = false,
  successMessage,
  errorMessage = 'No se pudo completar la operación.',
  onConfirm,
  children,
}: ConfirmModalProps) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      if (successMessage) message.success(successMessage)
      onClose()
    } catch (error) {
      message.error(getErrorMessage(error, errorMessage))
    } finally {
      setLoading(false)
    }
  }

  const danger = tone === 'danger'

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={icon}
      tone={tone}
      width={width}
      footer={
        <div
          className={`hmap-modal__footer${stacked ? ' hmap-modal__footer--stacked' : ''}`}
        >
          {stacked ? (
            <>
              <Button
                type="primary"
                danger={danger}
                block
                className={danger ? undefined : 'btn-forest'}
                loading={loading}
                disabled={confirmDisabled}
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
              <Button block onClick={onClose} disabled={loading}>
                {cancelText}
              </Button>
            </>
          ) : (
            <>
              <Button type="text" onClick={onClose} disabled={loading}>
                {cancelText}
              </Button>
              <Button
                type="primary"
                danger={danger}
                className={danger ? undefined : 'btn-forest'}
                loading={loading}
                disabled={confirmDisabled}
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </>
          )}
        </div>
      }
    >
      {children}
    </BaseModal>
  )
}
