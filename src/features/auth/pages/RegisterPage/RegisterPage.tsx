import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { App, Button, Col, Divider, Form, Input, Row } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { useAuth } from '@/features/auth/context/AuthContext'
import { getErrorMessage } from '@/shared/api/client'

interface RegisterForm {
  name: string
  apellido: string
  email: string
  password: string
  confirm: string
}

/** HU-003 — Registro de usuario. */
export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  // Igual que en login: retoma la ruta previa (RNF-006).
  const from = (location.state as { from?: string } | null)?.from

  const onFinish = async (values: RegisterForm) => {
    setLoading(true)
    try {
      await register({
        name: values.name,
        last_name: values.apellido,
        email: values.email,
        password: values.password,
      })
      message.success('¡Cuenta creada con éxito!')
      navigate(from ?? '/panel', { replace: true })
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo crear la cuenta.'))
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Nombre"
              rules={[{ required: true, message: 'Ingresa tu nombre.' }]}
            >
              <Input
                prefix={<UserOutlined className="auth-form__prefix-icon" />}
                placeholder="Ana"
                autoComplete="given-name"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="apellido"
              label="Apellido"
              rules={[{ required: true, message: 'Ingresa tu apellido.' }]}
            >
              <Input placeholder="Solano" autoComplete="family-name" />
            </Form.Item>
          </Col>
        </Row>

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
          rules={[
            { required: true, message: 'Ingresa una contraseña.' },
            { min: 8, message: 'Mínimo 8 caracteres.' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="auth-form__prefix-icon" />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
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
          <Input.Password
            prefix={<LockOutlined className="auth-form__prefix-icon" />}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          className="btn-cta auth-form__submit"
          loading={loading}
        >
          Crear cuenta
        </Button>

        <Divider className="auth-form__divider">Ya es cliente</Divider>

        <p className="auth-form__alt">
          ¿Ya tiene una cuenta?{' '}
          <Link
            to="/login"
            state={from ? { from } : undefined}
            className="auth-form__link"
          >
            Inicie sesión
          </Link>
        </p>
      </Form>
    </AuthCard>
  )
}
