import { useEffect, useState } from 'react'
import { App, Form, Input, Modal, Select } from 'antd'
import { adminUsersApi } from '@/features/admin/api/adminUsers.api'
import { getErrorMessage, getFieldErrors } from '@/shared/api/client'
import type { AdminUser, AssignableRole, UpdateUserRequest } from '@/features/admin/types'
import './EditUserModal.scss'

interface EditUserModalProps {
  user: AdminUser | null
  open: boolean
  onClose: () => void
  /** Se invoca tras editar el usuario con éxito. */
  onSaved: () => void
}

interface FormValues {
  name: string
  last_name: string
  email: string // solo para mostrar, no se envía
  role: AssignableRole
  active: boolean
}

const ROLE_OPTIONS = [
  { value: 'RECEPCIONISTA' as const, label: 'Recepcionista' },
  { value: 'ADMINISTRADOR' as const, label: 'Administrador' },
]

const STATUS_OPTIONS = [
  { value: true, label: 'Activo' },
  { value: false, label: 'Inactivo' },
]

/** HU-031/032 — Edición de datos y rol de usuario interno. */
export function EditUserModal({ user, open, onClose, onSaved }: EditUserModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        role: user.role as AssignableRole,
        active: user.active,
      })
    }
  }, [open, user, form])

  const submit = async (values: FormValues) => {
    if (!user) return

    const payload: UpdateUserRequest = {
      name: values.name.trim(),
      last_name: values.last_name.trim(),
      role: values.role,
    }

    setSaving(true)
    try {
      await adminUsersApi.update(user.id, payload)

      // Si el estado cambió, disparar el PATCH /active aparte.
      if (values.active !== user.active) {
        await adminUsersApi.setActive(user.id, values.active)
      }

      message.success('Usuario actualizado correctamente.')
      onSaved()
      onClose()
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        form.setFields(
          Object.entries(fieldErrors).map(([name, msg]) => ({
            name: name as keyof FormValues,
            errors: [msg],
          })),
        )
      } else {
        message.error(getErrorMessage(error, 'No se pudo actualizar el usuario.'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Guardar cambios"
      cancelText="Cancelar"
      confirmLoading={saving}
      title="Editar usuario"
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={submit}
        className="edit-user-form"
      >
        <div className="edit-user-form__grid">
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

        <Form.Item name="email" label="Correo electrónico">
          <Input disabled />
        </Form.Item>
        <p className="edit-user-form__hint">
          El correo identifica la cuenta y no se puede cambiar.
        </p>

        <div className="edit-user-form__grid">
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Selecciona un rol.' }]}
          >
            <Select options={ROLE_OPTIONS} placeholder="Selecciona el rol" />
          </Form.Item>

          <Form.Item
            name="active"
            label="Estado"
            rules={[{ required: true, message: 'Selecciona el estado.' }]}
          >
            <Select options={STATUS_OPTIONS} placeholder="Selecciona el estado" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
