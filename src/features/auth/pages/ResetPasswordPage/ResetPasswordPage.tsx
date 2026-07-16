import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { App, Button, Divider, Form, Input } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { authApi } from '@/features/auth/api/auth.api'
import { getErrorMessage } from '@/shared/api/client'

interface ResetForm {
  password: string
  confirm: string
}

/** HU-006 — Restablecer contraseña con el token del enlace. */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const token = searchParams.get('token') ?? ''

  const onFinish = async (values: ResetForm) => {
    if (!token) {
      message.error('El enlace de recuperación no es válido o ha expirado.')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword({ token, password: values.password })
      message.success('Contraseña actualizada. Ya puedes iniciar sesión.')
      navigate('/login')
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo actualizar la contraseña.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <Form
        className="auth-form"
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
      >
        <h2 className="auth-form__heading">Crear nueva contraseña</h2>
        <p className="auth-form__subtitle">
          Tu nueva contraseña debe ser diferente a las anteriores.
        </p>

        <Form.Item
          name="password"
          label="Nueva contraseña"
          rules={[
            { required: true, message: 'Ingresa una contraseña.' },
            { min: 8, message: 'Mínimo 8 caracteres.' },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="••••••••" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirmar contraseña"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Confirma tu contraseña.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
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
          className="btn-cta auth-form__submit"
          loading={loading}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          Guardar contraseña
        </Button>

        <Divider className="auth-form__divider" />

        <Link to="/login" className="auth-form__back">
          <ArrowLeftOutlined /> Regresar al Login
        </Link>
      </Form>
    </AuthCard>
  )
}
