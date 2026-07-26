import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Form, Input } from 'antd'
import { ArrowLeftOutlined, LockOutlined } from '@ant-design/icons'
import { profileApi } from '@/features/client/api/profile.api'
import { getErrorMessage } from '@/shared/api/client'
import { PasswordStrength } from '@/features/auth/components/PasswordStrength/PasswordStrength'
import './ChangePasswordPage.scss'

interface ChangePasswordForm {
  current_password: string
  new_password: string
  confirm: string
}

/** HU-015 — Cambio de contraseña con la contraseña actual. */
export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const onFinish = async (values: ChangePasswordForm) => {
    setSaving(true)
    try {
      await profileApi.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      })
      message.success('Contraseña actualizada con éxito.')
      navigate('/panel/perfil')
    } catch (error) {
      message.error(
        getErrorMessage(error, 'No se pudo actualizar la contraseña.'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="change-password">
      <nav className="change-password__breadcrumb">
        <Link to="/panel/perfil">Mi Perfil</Link>
        <span>›</span>
        <span>Cambiar contraseña</span>
      </nav>

      <h1 className="change-password__title">Cambiar Contraseña</h1>

      <section className="change-password__card">
        <span className="change-password__icon">
          <LockOutlined />
        </span>
        <p className="change-password__hint">
          Asegure su cuenta eligiendo una contraseña robusta.
        </p>

        <Form<ChangePasswordForm>
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

          <Button
            type="primary"
            htmlType="submit"
            className="btn-cta change-password__submit"
            loading={saving}
            block
          >
            Actualizar contraseña
          </Button>

          <Link to="/panel/perfil" className="change-password__back">
            <ArrowLeftOutlined /> Volver al perfil
          </Link>
        </Form>
      </section>
    </div>
  )
}
