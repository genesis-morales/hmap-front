import { useEffect } from 'react'
import { App, Form, Input } from 'antd'
import { UserSwitchOutlined } from '@ant-design/icons'
import { adminUsersApi } from '@/features/admin/api/adminUsers.api'
import { applyApiError } from '@/shared/api/client'
import {
  ConfirmModal,
  FormModal,
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

interface DeactivationForm {
  observation: string
}

/** HU-033 — Activar o desactivar cuenta de usuario. */
export function ToggleActiveModal({
  user,
  open,
  onClose,
  onToggled,
}: ToggleActiveModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<DeactivationForm>()

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  if (!user) return null

  const newState = !user.active

  // Caso 1: ACTIVAR usuario → ConfirmModal simple
  if (newState === true) {
    const handleActivate = async () => {
      await adminUsersApi.setActive(user.id, true)
      message.success('Usuario activado correctamente.')
      onToggled()
    }

    return (
      <ConfirmModal
        open={open}
        onClose={onClose}
        tone="success"
        icon={<UserSwitchOutlined />}
        title="¿Activar usuario?"
        description="Estás a punto de activar la cuenta de:"
        confirmText="Activar"
        errorMessage="No se pudo activar el usuario."
        onConfirm={handleActivate}
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
      </ConfirmModal>
    )
  }

  // Caso 2: DESACTIVAR usuario → FormModal con textarea obligatorio
  const handleDeactivate = async () => {
    try {
      const { observation } = await form.validateFields()
      await adminUsersApi.setActive(user.id, false, observation)
      message.success('Usuario desactivado correctamente.')
      onToggled()
      onClose()
    } catch (error) {
      // Si es error de validación del formulario, no hacer nada (Antd ya lo muestra)
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      // Si es error de la API, anclar los errores al formulario
      applyApiError(error, form, 'No se pudo desactivar el usuario.')
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleDeactivate}
      submitText="Desactivar"
      title="¿Desactivar usuario?"
      width={560}
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

      <ModalNote tone="danger">
        Un usuario desactivado no podrá iniciar sesión.
      </ModalNote>

      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="observation"
          label="Motivo de la desactivación"
          rules={[
            { required: true, message: 'Debes indicar el motivo de la desactivación.' },
            { max: 300, message: 'Máximo 300 caracteres.' },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Indica el motivo de la desactivación (máx. 300 caracteres)"
            showCount
            maxLength={300}
          />
        </Form.Item>
      </Form>
    </FormModal>
  )
}
