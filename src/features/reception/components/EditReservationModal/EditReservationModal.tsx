import { useEffect, useState } from 'react'
import { App, DatePicker, Form, Modal, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { getErrorMessage } from '@/shared/api/client'
import { API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import type { Reservation } from '@/features/client/types'

const { RangePicker } = DatePicker

interface EditReservationModalProps {
  reservation: Reservation | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

interface FormValues {
  stay: [Dayjs, Dayjs]
  guests: number
}

/** HU-021 — Edición de fechas/personas desde recepción (sin ventana de plazo). */
export function EditReservationModal({
  reservation,
  open,
  onClose,
  onSaved,
}: EditReservationModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && reservation) {
      form.setFieldsValue({
        stay: [dayjs(reservation.check_in), dayjs(reservation.check_out)],
        guests: reservation.guests,
      })
    }
  }, [open, reservation, form])

  const submit = async (values: FormValues) => {
    if (!reservation) return
    const [checkIn, checkOut] = values.stay
    setSaving(true)
    try {
      await reservationsApi.update(reservation.id, {
        check_in: checkIn.format(API_DATE_FORMAT),
        check_out: checkOut.format(API_DATE_FORMAT),
        guests: values.guests,
      })
      message.success('Reserva actualizada.')
      onSaved()
      onClose()
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo actualizar la reserva.'))
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
      title={`Editar reserva ${reservation?.code ?? ''}`}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
        <Form.Item
          name="stay"
          label="Entrada — Salida"
          rules={[{ required: true, message: 'Selecciona las fechas.' }]}
        >
          <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item
          name="guests"
          label="Personas"
          rules={[{ required: true, message: 'Indica el número de personas.' }]}
        >
          <Select
            options={Array.from(
              { length: reservation?.room.capacity ?? 6 },
              (_, i) => ({
                value: i + 1,
                label: `${i + 1} ${i === 0 ? 'persona' : 'personas'}`,
              }),
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
