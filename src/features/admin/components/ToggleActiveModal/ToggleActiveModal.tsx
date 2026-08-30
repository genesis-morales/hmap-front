import { App } from 'antd'
import { UserSwitchOutlined } from '@ant-design/icons'
import { adminUsersApi } from '@/features/admin/api/adminUsers.api'
import {
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalNote,
} from '@/shared/components/Modal'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import {
  USER_ROLE_LABEL,
  USER_ROLE_TONE,
  USER_ACTIVE_LABEL,
  USER_ACTIVE_TONE,
} from '@/features/admin/lib/userRole'
import type { AdminUser } from '@/features/admin/types'

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

  if (!user) return null

  const newState = !user.active
  const action = newState ? 'activar' : 'desactivar'
  const actionCapitalized = newState ? 'Activar' : 'Desactivar'

  const handleConfirm = async () => {
    await adminUsersApi.setActive(user.id, newState)
    message.success(
      `Usuario ${newState ? 'activado' : 'desactivado'} correctamente.`,
    )
    onToggled()
  }

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      tone={newState ? 'success' : 'danger'}
      icon={<UserSwitchOutlined />}
      title={`¿${actionCapitalized} usuario?`}
      description={`Estás a punto de ${action} la cuenta de:`}
      confirmText={actionCapitalized}
      errorMessage={`No se pudo ${action} el usuario.`}
      onConfirm={handleConfirm}
    >
      <ModalSummary>
        <ModalSummaryRow label="Nombre">
          {user.name} {user.last_name}
        </ModalSummaryRow>
        <ModalSummaryRow label="Correo">{user.email}</ModalSummaryRow>
        <ModalSummaryRow label="Rol">
          <StatusTag tone={USER_ROLE_TONE[user.role]}>
            {USER_ROLE_LABEL[user.role]}
          </StatusTag>
        </ModalSummaryRow>
        <ModalSummaryRow label="Estado actual">
          <StatusTag tone={USER_ACTIVE_TONE[String(user.active)]}>
            {USER_ACTIVE_LABEL[String(user.active)]}
          </StatusTag>
        </ModalSummaryRow>
      </ModalSummary>

      {!newState && (
        <ModalNote tone="danger">
          Un usuario desactivado no podrá iniciar sesión.
        </ModalNote>
      )}
    </ConfirmModal>
  )
}
