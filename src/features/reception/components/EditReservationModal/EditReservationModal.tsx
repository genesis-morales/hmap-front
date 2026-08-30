import { useEffect, useState } from 'react'
import { App, DatePicker, Form, Select } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { applyApiError } from '@/shared/api/client'
import {
  FormModal,
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalSummaryCode,
} from '@/shared/components/Modal'
import { API_DATE_FORMAT, formatStayRange } from '@/features/rooms/lib/stay'
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
  /** Valores validados esperando confirmación; null = sin confirmar. */
  const [pending, setPending] = useState<FormValues | null>(null)

  useEffect(() => {
    if (open && reservation) {
      form.setFieldsValue({
        stay: [dayjs(reservation.check_in), dayjs(reservation.check_out)],
        guests: reservation.guests,
      })
    }
  }, [open, reservation, form])

  /** Paso 1: valida y abre la confirmación con el resumen. */
  const askConfirm = async () => {
    try {
      setPending(await form.validateFields())
    } catch {
      // Los errores de validación los pinta el propio Form.
    }
  }

  /** Paso 2: confirmado, se guardan los cambios. */
  const submit = async () => {
    if (!reservation || !pending) return
    const [checkIn, checkOut] = pending.stay
    try {
      await reservationsApi.update(reservation.id, {
        check_in: checkIn.format(API_DATE_FORMAT),
        check_out: checkOut.format(API_DATE_FORMAT),
        guests: pending.guests,
      })
      message.success('Reserva actualizada.')
      setPending(null)
      onSaved()
      onClose()
    } catch (error) {
      // Cierra la confirmación para anclar el error en el formulario
      // (p. ej. capacidad excedida → bajo `guests`).
      setPending(null)
      applyApiError(error, form, 'No se pudo actualizar la reserva.')
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={askConfirm}
      submitText="Guardar cambios"
      title={`Editar reserva ${reservation?.code ?? ''}`}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={askConfirm}>
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

      <ConfirmModal
        open={pending !== null}
        onClose={() => setPending(null)}
        tone="warning"
        icon={<EditOutlined />}
        title="¿Guardar estos cambios?"
        description="Se actualizarán las fechas y el número de personas."
        confirmText="Sí, guardar cambios"
        cancelText="No, volver"
        errorMessage="No se pudo actualizar la reserva."
        onConfirm={submit}
      >
        {pending && reservation && (
          <ModalSummary
            heading={`${reservation.guest.name} ${reservation.guest.last_name}`}
          >
            <ModalSummaryRow label="Fechas actuales">
              {formatStayRange(reservation.check_in, reservation.check_out)}
            </ModalSummaryRow>
            <ModalSummaryRow label="Fechas nuevas">
              {formatStayRange(
                pending.stay[0].format(API_DATE_FORMAT),
                pending.stay[1].format(API_DATE_FORMAT),
              )}
            </ModalSummaryRow>
            <ModalSummaryRow label="Personas">{pending.guests}</ModalSummaryRow>
            <ModalSummaryCode code={reservation.code} />
          </ModalSummary>
        )}
      </ConfirmModal>
    </FormModal>
  )
}
