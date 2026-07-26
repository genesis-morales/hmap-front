import { useState } from 'react'
import { Link } from 'react-router-dom'
import { App, Button, Form, Input } from 'antd'
import { ArrowRightOutlined, SafetyOutlined, TagOutlined } from '@ant-design/icons'
import { useAuth } from '@/features/auth/context/AuthContext'
import { profileApi } from '@/features/client/api/profile.api'
import { getErrorMessage } from '@/shared/api/client'
import { getInitials } from '@/features/client/lib/reservationUi'
import './ProfilePage.scss'

interface ProfileForm {
  name: string
  last_name: string
  phone?: string
}

/** HU-014 — Ver y editar los datos del perfil del cliente. */
export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { message } = App.useApp()
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const onFinish = async (values: ProfileForm) => {
    setSaving(true)
    try {
      const updated = await profileApi.updateMe({
        name: values.name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone?.trim() || null,
      })
      updateUser(updated)
      message.success('Perfil actualizado con éxito.')
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo actualizar el perfil.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile">
      <h1 className="profile__title">Mi Perfil</h1>

      <section className="profile__card">
        <div className="profile__identity">
          <span className="profile__avatar">
            {getInitials(user.name, user.last_name)}
          </span>
          <h2>
            {user.name} {user.last_name}
          </h2>
          <span className="profile__caption">Cliente del Hotel Manuel Antonio Park</span>
        </div>

        <Form<ProfileForm>
          layout="vertical"
          requiredMark={false}
          initialValues={{
            name: user.name,
            last_name: user.last_name,
            phone: user.phone ?? '',
          }}
          onFinish={onFinish}
          className="profile__form"
        >
          <div className="profile__row">
            <Form.Item
              name="name"
              label="Nombre"
              rules={[{ required: true, message: 'Ingresa tu nombre.' }]}
            >
              <Input autoComplete="given-name" />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Apellido"
              rules={[{ required: true, message: 'Ingresa tu apellido.' }]}
            >
              <Input autoComplete="family-name" />
            </Form.Item>
          </div>

          <Form.Item
            name="phone"
            label="Teléfono"
            // Solo dígitos mientras escribe; formato tico: 8 dígitos, inicia en 5-8
            normalize={(value: string) => value.replace(/\D/g, '').slice(0, 8)}
            rules={[
              {
                pattern: /^[5-8]\d{7}$/,
                message: 'Debe tener 8 dígitos y comenzar con 5, 6, 7 u 8.',
              },
            ]}
          >
            <Input
              placeholder="88880000"
              inputMode="numeric"
              maxLength={8}
              autoComplete="tel"
            />
          </Form.Item>

          <Form.Item label="Correo electrónico">
            <Input value={user.email} disabled />
            <span className="profile__email-note">El correo no puede modificarse</span>
          </Form.Item>

          <Link to="/panel/perfil/contrasena" className="profile__password-link">
            Cambiar contraseña <ArrowRightOutlined />
          </Link>

          <Button
            type="primary"
            htmlType="submit"
            className="btn-cta profile__submit"
            loading={saving}
            block
          >
            Guardar cambios
          </Button>
        </Form>
      </section>

      <div className="profile__info-grid">
        <section className="profile__info">
          <SafetyOutlined className="profile__info-icon" />
          <h3>Seguridad de la cuenta</h3>
          <p>
            Sus datos están protegidos bajo nuestros estándares de cifrado. Para
            cambios críticos, es posible que solicitemos verificación adicional.
          </p>
        </section>
        <section className="profile__info">
          <TagOutlined className="profile__info-icon" />
          <h3>Programa de lealtad</h3>
          <p>
            Como cliente frecuente, usted tiene acceso a beneficios exclusivos.
            Asegúrese de mantener su información actualizada para recibir ofertas
            personalizadas.
          </p>
        </section>
      </div>
    </div>
  )
}
