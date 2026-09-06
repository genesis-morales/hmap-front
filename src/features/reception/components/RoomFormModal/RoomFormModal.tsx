import { useEffect, useState } from 'react'
import { App, Form, Input, InputNumber, Select } from 'antd'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { roomsAdminApi } from '@/features/reception/api/roomsAdmin.api'
import { applyApiError } from '@/shared/api/client'
import {
  FormModal,
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
} from '@/shared/components/Modal'
import { formatMoney } from '@/features/rooms/lib/stay'
import { ROOM_STATUSES, ROOM_STATUS_LABEL } from '@/features/reception/lib/roomStatus'
import type { Room, RoomStatus } from '@/features/rooms/types'
import type { RoomRequest } from '@/features/reception/types'
import './RoomFormModal.scss'

interface RoomFormModalProps {
  /** Habitación a editar; null = alta. */
  room: Room | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

interface FormValues {
  name: string
  slug: string
  room_number: string
  description: string
  capacity: number
  area: number
  beds_label: string
  price_per_night: number
  smoking_policy: string
  status: RoomStatus
  images: string[]
  amenities: string[]
  bathroom: string[]
  views: string[]
}

/** '/' → slug amigable a partir del nombre. */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** HU-025/026 — Alta y edición de habitaciones. */
export function RoomFormModal({ room, open, onClose, onSaved }: RoomFormModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  /** Valores validados esperando confirmación; null = sin confirmar. */
  const [pending, setPending] = useState<FormValues | null>(null)
  const editing = room !== null

  useEffect(() => {
    if (!open) return
    if (room) {
      form.setFieldsValue({
        name: room.name,
        slug: room.slug,
        room_number: room.room_number,
        description: room.description,
        capacity: room.capacity,
        area: room.area,
        beds_label: room.beds_label,
        price_per_night: room.price_per_night,
        smoking_policy: room.smoking_policy,
        status: room.status,
        images: room.images,
        amenities: room.amenities,
        bathroom: room.bathroom,
        views: room.views,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ status: 'DISPONIBLE', capacity: 2, area: 20 })
    }
  }, [open, room, form])

  /** Paso 1: valida el formulario y abre la confirmación con el resumen. */
  const askConfirm = async () => {
    try {
      setPending(await form.validateFields())
    } catch {
      // Los errores de validación los pinta el propio Form.
    }
  }

  /** Paso 2: confirmado, se guarda la habitación. */
  const submit = async () => {
    if (!pending) return
    const payload: RoomRequest = {
      ...pending,
      slug: pending.slug?.trim() || toSlug(pending.name),
      room_number: pending.room_number.trim(),
      images: pending.images ?? [],
      amenities: pending.amenities ?? [],
      bathroom: pending.bathroom ?? [],
      views: pending.views ?? [],
    }
    try {
      if (room) {
        await roomsAdminApi.update(room.id, payload)
        message.success('Habitación actualizada.')
      } else {
        await roomsAdminApi.create(payload)
        message.success('Habitación creada.')
      }
      setPending(null)
      onSaved()
      onClose()
    } catch (error) {
      // Cierra la confirmación para que el error quede anclado en el formulario
      // (p. ej. slug duplicado → bajo el input `slug`).
      setPending(null)
      applyApiError(error, form, 'No se pudo guardar la habitación.')
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={askConfirm}
      submitText={editing ? 'Guardar cambios' : 'Crear habitación'}
      title={editing ? 'Editar habitación' : 'Nueva habitación'}
      width={620}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={askConfirm}>
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: 'Ingresa el nombre.' }]}
        >
          <Input placeholder="Suite Familiar" />
        </Form.Item>

        <div className="room-form__grid room-form__grid--2">
          <Form.Item
            name="room_number"
            label="Número de habitación"
            rules={[
              { required: true, message: 'Ingresa el número de habitación.' },
              { max: 10, message: 'Máximo 10 caracteres.' },
            ]}
          >
            <Input placeholder="Ej. 101, 102, A-3" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug (identificador para URL; se genera del nombre si se deja vacío)"
          >
            <Input placeholder="suite-familiar" />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ required: true, message: 'Ingresa una descripción.' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <div className="room-form__grid">
          <Form.Item
            name="capacity"
            label="Capacidad"
            rules={[{ required: true, message: 'Indica la capacidad.' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="area"
            label="Área (m²)"
            rules={[{ required: true, message: 'Indica el área.' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="price_per_night"
            label="Tarifa/noche (USD)"
            rules={[{ required: true, message: 'Indica la tarifa.' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
        </div>

        <div className="room-form__grid room-form__grid--2">
          <Form.Item
            name="beds_label"
            label="Camas"
            rules={[{ required: true, message: 'Describe las camas.' }]}
          >
            <Input placeholder="2 camas dobles" />
          </Form.Item>
          <Form.Item name="status" label="Estado">
            <Select
              options={ROOM_STATUSES.map((s) => ({
                value: s,
                label: ROOM_STATUS_LABEL[s],
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="smoking_policy"
          label="Política de humo"
          rules={[{ required: true, message: 'Indica la política de humo.' }]}
        >
          <Input placeholder="No se puede fumar" />
        </Form.Item>

        <Form.Item name="amenities" label="Comodidades">
          <Select mode="tags" placeholder="Aire acondicionado, TV..." open={false} />
        </Form.Item>
        <Form.Item name="bathroom" label="Baño">
          <Select mode="tags" placeholder="Ducha, WC..." open={false} />
        </Form.Item>
        <Form.Item name="views" label="Vistas">
          <Select mode="tags" placeholder="Vistas al jardín..." open={false} />
        </Form.Item>
        <Form.Item
          name="images"
          label="Imágenes (public IDs de Cloudinary, p. ej. hmap/rooms/slug/bed)"
        >
          <Select mode="tags" placeholder="hmap/rooms/suite-familiar/bed" open={false} />
        </Form.Item>
      </Form>

      <ConfirmModal
        open={pending !== null}
        onClose={() => setPending(null)}
        tone={editing ? 'warning' : 'success'}
        icon={editing ? <EditOutlined /> : <PlusOutlined />}
        title={editing ? '¿Guardar los cambios?' : '¿Crear esta habitación?'}
        description="Revise los datos antes de continuar."
        confirmText={editing ? 'Sí, guardar cambios' : 'Sí, crear habitación'}
        cancelText="No, volver"
        errorMessage="No se pudo guardar la habitación."
        onConfirm={submit}
      >
        {pending && (
          <ModalSummary heading={pending.name}>
            <ModalSummaryRow label="Número">{pending.room_number}</ModalSummaryRow>
            <ModalSummaryRow label="Camas">{pending.beds_label}</ModalSummaryRow>
            <ModalSummaryRow label="Capacidad">
              {pending.capacity} personas
            </ModalSummaryRow>
            <ModalSummaryRow label="Área">{pending.area} m²</ModalSummaryRow>
            <ModalSummaryRow label="Tarifa">
              {formatMoney(pending.price_per_night)} /noche
            </ModalSummaryRow>
            <ModalSummaryRow label="Estado">
              {ROOM_STATUS_LABEL[pending.status]}
            </ModalSummaryRow>
          </ModalSummary>
        )}
      </ConfirmModal>
    </FormModal>
  )
}
