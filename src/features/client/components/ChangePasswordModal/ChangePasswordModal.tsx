import { useState } from 'react'
import { App, Form, Input } from 'antd'
import { profileApi } from '@/features/client/api/profile.api'
import { applyApiError } from '@/shared/api/client'
import { FormModal } from '@/shared/components/Modal'
import { PasswordStrength } from '@/features/auth/components/PasswordStrength/PasswordStrength'

interface ChangePasswordForm {
  current_password: string
  new_password: string
  confirm: string
}

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

/** HU-015 — Cambio de contraseña con la contraseña actual. */
export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<ChangePasswordForm>()
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const close = () => {
    form.resetFields()
    setNewPassword('')
    onClose()
  }

  const onFinish = async (values: ChangePasswordForm) => {
    setSaving(true)
    try {
      await profileApi.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      })
      message.success('Contraseña actualizada con éxito.')
      close()
    } catch (error) {
      applyApiError(error, form, 'No se pudo actualizar la contraseña.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormModal
      open={open}
      onClose={close}
      onSubmit={() => form.submit()}
      submitText="Actualizar contraseña"
      saving={saving}
      title="Cambiar contraseña"
      description="Asegure su cuenta eligiendo una contraseña robusta."
    >
      <Form<ChangePasswordForm>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
      >
        <Form.Item
          name="current_password"
          label="Contraseña actual"
          rules={[{ required: true, message: 'Ingresa tu contraseña actual.' }]}
        >
          <Input.Password placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>

        <Form.Item
          name="new_password"
          label="Nueva contraseña"
          rules={[
            { required: true, message: 'Ingresa la nueva contraseña.' },
            { min: 8, message: 'Mínimo 8 caracteres.' },
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            autoComplete="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Item>

        <PasswordStrength password={newPassword} />

        <Form.Item
          name="confirm"
          label="Confirmar nueva contraseña"
          dependencies={['new_password']}
          rules={[
            { required: true, message: 'Confirma la nueva contraseña.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('Las contraseñas no coinciden.'))
              },
            }),
          ]}
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </FormModal>
  )
}
