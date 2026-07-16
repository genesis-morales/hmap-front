import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { App, Button, Divider } from 'antd'
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons'
import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { authApi } from '@/features/auth/api/auth.api'
import { getErrorMessage } from '@/shared/api/client'
import './EmailSentPage.scss'

/** Confirmación tras solicitar el enlace de recuperación. */
export function EmailSentPage() {
  const location = useLocation()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const email = (location.state as { email?: string } | null)?.email

  const resend = async () => {
    if (!email) return
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      message.success('Enlace reenviado.')
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo reenviar el enlace.'))
    } finally {
      setLoading(false)
    }
  }

  const header = (
    <div className="email-sent__header">
      <span className="email-sent__icon">
        <MailOutlined />
      </span>
      <h2 className="email-sent__title">¡Revisa tu correo!</h2>
    </div>
  )

  return (
    <AuthCard header={header}>
      <p className="email-sent__text">
        Te enviamos un enlace para restablecer tu contraseña
        {email && (
          <>
            {' '}
            a <strong>{email}</strong>
          </>
        )}
        . Revisa también tu carpeta de spam.
      </p>

      <Button
        type="primary"
        className="btn-cta auth-form__submit"
        loading={loading}
        disabled={!email}
        onClick={resend}
      >
        Reenviar enlace
      </Button>

      <Divider className="auth-form__divider" />

      <Link to="/login" className="auth-form__back">
        <ArrowLeftOutlined /> Regresar al Login
      </Link>
    </AuthCard>
  )
}
