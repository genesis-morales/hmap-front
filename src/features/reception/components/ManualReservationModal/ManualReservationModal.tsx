import { useEffect, useState } from 'react'
import { App, DatePicker, Form, Input, Select } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import {
  FormModal,
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalNote,
} from '@/shared/components/Modal'
import dayjs, { type Dayjs } from 'dayjs'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { receptionApi } from '@/features/reception/api/reception.api'
import { applyApiError } from '@/shared/api/client'
import { API_DATE_FORMAT, formatMoney } from '@/features/rooms/lib/stay'
import type { Room } from '@/features/rooms/types'
import type { Reservation } from '@/features/client/types'
import './ManualReservationModal.scss'

const { RangePicker } = DatePicker

interface ManualReservationModalProps {
  open: boolean
  onClose: () => void
  /** Se invoca tras crear la reserva con éxito. */
  onCreated: (reservation: Reservation) => void
}

interface FormValues {
  stay: [Dayjs, Dayjs]
  guests: number
  room_id: number
  name: string
  last_name: string
  email: string
  phone?: string
}

/**
 * HU-020 — Alta de una reserva a nombre de un huésped desde recepción.
 * Reutiliza el motor de disponibilidad del catálogo (E2): primero se eligen
 * fechas y personas, y solo se listan las habitaciones libres en ese rango.
 */
export function ManualReservationModal({
  open,
  onClose,
  onCreated,
}: ManualReservationModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const stay = Form.useWatch('stay', form)
  const guests = Form.useWatch('guests', form)

  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  /** Valores validados esperando confirmación; null = sin confirmar. */
  const [pending, setPending] = useState<FormValues | null>(null)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setRooms([])
    }
  }, [open, form])

  // Consulta de disponibilidad cuando ya hay fechas y personas.
  useEffect(() => {
    if (!open) return
    const from = stay?.[0]
    const to = stay?.[1]
    if (!from || !to || !guests) {
      setRooms([])
      return
    }
    let cancelled = false
    setLoadingRooms(true)
    roomsApi
      .availability({
        check_in: from.format(API_DATE_FORMAT),
        check_out: to.format(API_DATE_FORMAT),
        guests,
      })
      .then((list) => {
        if (cancelled) return
        setRooms(list)
        // Si la habitación elegida dejó de estar disponible, se limpia.
        const current = form.getFieldValue('room_id')
        if (current && !list.some((r) => r.id === current)) {
          form.setFieldValue('room_id', undefined)
        }
      })
      .catch(() => !cancelled && setRooms([]))
      .finally(() => !cancelled && setLoadingRooms(false))
    return () => {
      cancelled = true
    }
  }, [open, stay, guests, form])

  const hasDates = Boolean(stay?.[0] && stay?.[1])

  /** Paso 1: valida el formulario y abre la confirmación con el resumen. */
  const askConfirm = async () => {
    try {
      const values = await form.validateFields()
      setPending(values)
    } catch {
      // Los errores de validación los pinta el propio Form.
    }
  }

  /** Paso 2: confirmado por el recepcionista, se crea la reserva. */
  const submit = async () => {
    if (!pending) return
    const [checkIn, checkOut] = pending.stay
    try {
      const reservation = await receptionApi.createManual({
        room_id: pending.room_id,
        check_in: checkIn.format(API_DATE_FORMAT),
        check_out: checkOut.format(API_DATE_FORMAT),
        guests: pending.guests,
        guest: {
          name: pending.name.trim(),
          last_name: pending.last_name.trim(),
          email: pending.email.trim(),
          phone: pending.phone?.trim() || undefined,
        },
      })
      message.success('Reserva creada. Se notificó al cliente por correo.')
      form.resetFields()
      setPending(null)
      onCreated(reservation)
      onClose()
    } catch (error) {
      // Cierra la confirmación y ancla el error en el formulario de atrás,
      // para que el recepcionista vea qué campo corregir.
      setPending(null)
      applyApiError(error, form, 'No se pudo crear la reserva.')
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={askConfirm}
      submitText="Crear reserva"
      title="Nueva reserva"
      width={560}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={askConfirm}>
        <Form.Item
          name="stay"
          label="Entrada — Salida"
          rules={[{ required: true, message: 'Selecciona las fechas.' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={(d) => d.isBefore(dayjs(), 'day')}
          />
        </Form.Item>

        <Form.Item
          name="guests"
          label="Personas"
          initialValue={2}
          rules={[{ required: true, message: 'Indica el número de personas.' }]}
        >
          <Select
            options={[1, 2, 3, 4, 5, 6].map((n) => ({
              value: n,
              label: `${n} ${n === 1 ? 'persona' : 'personas'}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="room_id"
          label="Habitación disponible"
          rules={[{ required: true, message: 'Selecciona una habitación.' }]}
          extra={
            !hasDates
              ? 'Elige primero las fechas y las personas para ver disponibilidad.'
              : !loadingRooms && rooms.length === 0
                ? 'No hay habitaciones libres para ese rango y capacidad.'
                : undefined
          }
        >
          <Select
            placeholder={
              hasDates ? 'Selecciona una habitación' : 'Selecciona fechas primero'
            }
            disabled={!hasDates}
            loading={loadingRooms}
            notFoundContent={loadingRooms ? 'Buscando...' : 'Sin disponibilidad'}
            options={rooms.map((room) => ({
              value: room.id,
              label: `${room.name} — ${formatMoney(room.price_per_night)}/noche (${room.capacity} pers.)`,
            }))}
          />
        </Form.Item>

        <div className="manual-reservation__grid">
          <Form.Item
            name="name"
            label="Nombre del huésped"
            rules={[{ required: true, message: 'Ingresa el nombre.' }]}
          >
            <Input placeholder="Carlos" />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[{ required: true, message: 'Ingresa el apellido.' }]}
          >
            <Input placeholder="Ruiz" />
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
          <Input placeholder="carlos@mail.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Teléfono (opcional)"
          normalize={(value: string) => value.replace(/\D/g, '').slice(0, 8)}
          rules={[
            {
              pattern: /^[5-8]\d{7}$/,
              message: 'Debe tener 8 dígitos y comenzar con 5, 6, 7 u 8.',
            },
          ]}
        >
          <Input placeholder="88880000" inputMode="numeric" maxLength={8} />
        </Form.Item>
      </Form>

      <ConfirmModal
        open={pending !== null}
        onClose={() => setPending(null)}
        tone="success"
        icon={<CheckCircleOutlined />}
        title="¿Crear esta reserva?"
        description="Revise los datos antes de registrarla."
        confirmText="Sí, crear reserva"
        cancelText="No, volver"
        errorMessage="No se pudo crear la reserva."
        onConfirm={submit}
      >
        {pending && (
          <ModalSummary
            heading={`${pending.name} ${pending.last_name}`.trim()}
          >
            <ModalSummaryRow label="Correo">{pending.email}</ModalSummaryRow>
            <ModalSummaryRow label="Habitación">
              {rooms.find((r) => r.id === pending.room_id)?.name ?? '—'}
            </ModalSummaryRow>
            <ModalSummaryRow label="Entrada">
              {pending.stay[0].format('DD/MM/YYYY')}
            </ModalSummaryRow>
            <ModalSummaryRow label="Salida">
              {pending.stay[1].format('DD/MM/YYYY')}
            </ModalSummaryRow>
            <ModalSummaryRow label="Personas">{pending.guests}</ModalSummaryRow>
          </ModalSummary>
        )}

        <ModalNote tone="info">
          Se enviará un correo de confirmación al cliente.
        </ModalNote>
      </ConfirmModal>
    </FormModal>
  )
}
