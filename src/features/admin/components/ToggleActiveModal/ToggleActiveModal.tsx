import { useState } from 'react'
import { App, Modal } from 'antd'
import { adminUsersApi } from '@/features/admin/api/adminUsers.api'
import { getErrorMessage } from '@/shared/api/client'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import {
  USER_ROLE_LABEL,
  USER_ROLE_TONE,
  USER_ACTIVE_LABEL,
  USER_ACTIVE_TONE,
} from '@/features/admin/lib/userRole'
import type { AdminUser } from '@/features/admin/types'
import './ToggleActiveModal.scss'

interface ToggleActiveModalProps {
  user: AdminUser | null
  open: boolean
  onClose: () => void
  /** Se invoca tras cambiar el estado con éxito. */
  onToggled: () => void
}

/** HU-033 — Activar o desactivar cuenta de usuario. */
export function ToggleActiveModal({
  user,
  open,
  onClose,
  onToggled,
}: ToggleActiveModalProps) {
  const { message } = App.useApp()
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const newState = !user.active
  const action = newState ? 'activar' : 'desactivar'
  const actionCapitalized = newState ? 'Activar' : 'Desactivar'

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await adminUsersApi.setActive(user.id, newState)
      message.success(
        `Usuario ${newState ? 'activado' : 'desactivado'} correctamente.`,
      )
      onToggled()
      onClose()
    } catch (error) {
      message.error(
        getErrorMessage(error, `No se pudo ${action} el usuario.`),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText={actionCapitalized}
      cancelText="Cancelar"
      confirmLoading={saving}
      title={`¿${actionCapitalized} usuario?`}
      width={480}
      okButtonProps={{ danger: !newState }}
    >
      <div className="toggle-active-modal">
        <p className="toggle-active-modal__message">
          Estás a punto de {action} la cuenta de:
        </p>

        <div className="toggle-active-modal__card">
          <div className="toggle-active-modal__row">
            <span className="toggle-active-modal__label">Nombre:</span>
            <span className="toggle-active-modal__value">
              {user.name} {user.last_name}
            </span>
          </div>
          <div className="toggle-active-modal__row">
            <span className="toggle-active-modal__label">Correo:</span>
            <span className="toggle-active-modal__value">{user.email}</span>
          </div>
          <div className="toggle-active-modal__row">
            <span className="toggle-active-modal__label">Rol:</span>
            <StatusTag tone={USER_ROLE_TONE[user.role]}>
              {USER_ROLE_LABEL[user.role]}
            </StatusTag>
          </div>
          <div className="toggle-active-modal__row">
            <span className="toggle-active-modal__label">Estado actual:</span>
            <StatusTag tone={USER_ACTIVE_TONE[String(user.active)]}>
              {USER_ACTIVE_LABEL[String(user.active)]}
            </StatusTag>
          </div>
        </div>

        {!newState && (
          <p className="toggle-active-modal__warning">
            Un usuario desactivado no podrá iniciar sesión.
          </p>
        )}
      </div>
    </Modal>
  )
}
