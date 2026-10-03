import { useState } from 'react'
import { App, Input } from 'antd'
import { CalendarOutlined, ExclamationOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { ConfirmModal, ModalSummary, ModalSummaryCode, ModalNote } from '@/shared/components/Modal'
import { formatStayRange, nightsLabel } from '@/features/rooms/lib/stay'
import type { Reservation } from '@/features/client/types'

interface CancelReservationModalProps {
  reservation: Reservation
  open: boolean
  onClose: () => void
  /** Recibe la reserva ya cancelada por la API. */
  onCancelled: (updated: Reservation) => void
}

/** HU-013 — Confirmación de cancelación de reserva. */
export function CancelReservationModal({
  reservation,
  open,
  onClose,
  onCancelled,
}: CancelReservationModalProps) {
  const { message } = App.useApp()
  const [reason, setReason] = useState('')

  const confirm = async () => {
    const updated = await reservationsApi.cancel(reservation.id, reason || undefined)
    message.success('Reserva cancelada. Te enviamos un correo de confirmación.')
    onCancelled(updated)
  }

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      tone="danger"
      icon={<ExclamationOutlined />}
      title="¿Cancelar esta reserva?"
      description="Esta acción no se puede deshacer."
      confirmText="Sí, cancelar reserva"
      cancelText="No, mantener reserva"
      stacked
      errorMessage="No se pudo cancelar la reserva."
      onConfirm={confirm}
    >
      <ModalSummary heading={reservation.room.name}>
        <ModalNote tone="plain" icon={<CalendarOutlined />}>
          {formatStayRange(reservation.check_in, reservation.check_out)} ·{' '}
          {nightsLabel(reservation.nights)}
        </ModalNote>
        <ModalSummaryCode code={reservation.code} />
      </ModalSummary>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="cancel-reason" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          Motivo de cancelación (opcional)
        </label>
        <Input.TextArea
          id="cancel-reason"
          placeholder="Puedes indicarnos por qué cancelas tu reserva..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          showCount
        />
      </div>

      <ModalNote tone="plain" icon={<InfoCircleOutlined />}>
        Se enviará un correo de confirmación de cancelación a tu correo
        registrado.
      </ModalNote>
    </ConfirmModal>
  )
}
