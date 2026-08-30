import { useEffect, useState } from 'react'
import { App, Form, Input, Select } from 'antd'
import { adminUsersApi } from '@/features/admin/api/adminUsers.api'
import { applyApiError } from '@/shared/api/client'
import { FormModal } from '@/shared/components/Modal'
import type { AssignableRole, CreateUserRequest } from '@/features/admin/types'
import './CreateUserModal.scss'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  /** Se invoca tras crear el usuario con éxito. */
  onCreated: () => void
}

interface FormValues {
  name: string
  last_name: string
  email: string
  password: string
  confirm_password: string
  role: AssignableRole
}

const ROLE_OPTIONS = [
  { value: 'RECEPCIONISTA' as const, label: 'Recepcionista' },
  { value: 'ADMINISTRADOR' as const, label: 'Administrador' },
]

/** HU-030 — Alta de usuario interno con rol y contraseña inicial. */
export function CreateUserModal({ open, onClose, onCreated }: CreateUserModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      form.resetFields()
      form.setFieldsValue({ role: 'RECEPCIONISTA' })
    }
  }, [open, form])

  const submit = async (values: FormValues) => {
    const payload: CreateUserRequest = {
      name: values.name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
    }

    setSaving(true)
    try {
      await adminUsersApi.create(payload)
      message.success('Usuario creado correctamente.')
      onCreated()
      onClose()
    } catch (error) {
      applyApiError(error, form, 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() => form.submit()}
      submitText="Crear usuario"
      saving={saving}
      title="Nuevo usuario"
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={submit}
        className="create-user-form"
      >
        <div className="create-user-form__grid">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Ingresa el nombre.' }]}
          >
            <Input placeholder="Carlos" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[{ required: true, message: 'Ingresa el apellido.' }]}
          >
            <Input placeholder="Rojas" />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[
            { required: true, message: 'Ingresa el correo.' },
            { type: 'email', message: 'Correo no válido.' },
          ]}
        >
          <Input placeholder="carlos@hmap.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Contraseña"
          rules={[
            { required: true, message: 'Ingresa una contraseña.' },
            { min: 8, message: 'Mínimo 8 caracteres.' },
          ]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          name="confirm_password"
          label="Confirmar contraseña"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Confirma la contraseña.' },
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
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Rol"
          rules={[{ required: true, message: 'Selecciona un rol.' }]}
        >
          <Select options={ROLE_OPTIONS} placeholder="Selecciona el rol" />
        </Form.Item>

        <div className="create-user-form__notice">
          <span className="create-user-form__notice-label">Estado:</span>
          <span className="create-user-form__notice-value">Activo</span>
        </div>
      </Form>
    </FormModal>
  )
}
