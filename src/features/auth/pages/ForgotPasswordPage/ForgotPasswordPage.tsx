import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Divider, Form, Input } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, MailOutlined } from '@ant-design/icons'
import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { authApi } from '@/features/auth/api/auth.api'
import { getErrorMessage } from '@/shared/api/client'

/** HU-005 — Solicitar recuperación de contraseña. */
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const onFinish = async ({ email }: { email: string }) => {
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      navigate('/recuperar-contrasena/enviado', { state: { email } })
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo enviar el enlace.'))
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
        <h2 className="auth-form__heading">¿Olvidaste tu contraseña?</h2>
        <p className="auth-form__subtitle">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[
            { required: true, message: 'Ingresa tu correo.' },
            { type: 'email', message: 'Correo no válido.' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="auth-form__prefix-icon" />}
            placeholder="nature@lover.com"
            autoComplete="email"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          className="btn-cta auth-form__submit"
          loading={loading}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          Enviar enlace
        </Button>

        <Divider className="auth-form__divider" />

        <Link to="/login" className="auth-form__back">
          <ArrowLeftOutlined /> Regresar al Login
        </Link>
      </Form>
    </AuthCard>
  )
}
