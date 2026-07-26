import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { App, Button, Checkbox, Divider, Form, Input } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getErrorMessage } from '@/shared/api/client'
import type { LoginRequest } from '@/features/auth/types'

interface LoginForm extends LoginRequest {
  remember: boolean
}

/** HU-004 — Inicio de sesión. */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  // Ruta previa conservada por RequireAuth (RNF-006: la búsqueda
  // de disponibilidad viaja en la query y se retoma tras el login).
  const from = (location.state as { from?: string } | null)?.from

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      await login({ email: values.email, password: values.password })
      message.success('¡Bienvenido de vuelta!')
      navigate(from ?? '/panel', { replace: true })
    } catch (error) {
      message.error(getErrorMessage(error, 'Correo o contraseña incorrectos.'))
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
        initialValues={{ remember: true }}
      >
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

        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: true, message: 'Ingresa tu contraseña.' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="auth-form__prefix-icon" />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <div className="auth-form__row">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Mantener sesión iniciada</Checkbox>
          </Form.Item>
          <Link to="/recuperar-contrasena" className="auth-form__link">
            ¿Olvidó su contraseña?
          </Link>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          className="btn-cta auth-form__submit"
          loading={loading}
        >
          Entrar
        </Button>

        <Divider className="auth-form__divider">Cree su cuenta</Divider>

        <p className="auth-form__alt">
          ¿No tiene una cuenta?{' '}
          <Link
            to="/registro"
            state={from ? { from } : undefined}
            className="auth-form__link"
          >
            Regístrese ahora
          </Link>
        </p>
      </Form>
    </AuthCard>
  )
}
