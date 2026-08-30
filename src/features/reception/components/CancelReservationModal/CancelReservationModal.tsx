import { useState } from 'react'
import { App, Input } from 'antd'
import { ExclamationOutlined } from '@ant-design/icons'
import { receptionApi } from '@/features/reception/api/reception.api'
import { ConfirmModal, ModalSummary, ModalSummaryRow } from '@/shared/components/Modal'
import type { Reservation } from '@/features/client/types'

interface CancelReservationModalProps {
  reservation: Reservation | null
  open: boolean
  onClose: () => void
  onCancelled: () => void
}

/** HU-022 — Cancelación de una reserva desde recepción, con motivo obligatorio. */
export function CancelReservationModal({
  reservation,
  open,
  onClose,
  onCancelled,
}: CancelReservationModalProps) {
  const { message } = App.useApp()
  const [reason, setReason] = useState('')

  // El motivo se limpia al cerrar; destroyOnHidden desmonta el contenido.
  const close = () => {
    setReason('')
    onClose()
  }

  if (!reservation) return null

  const submit = async () => {
    await receptionApi.cancel(reservation.id, reason.trim())
    message.success('Reserva cancelada. Se notificó al cliente.')
    onCancelled()
    setReason('')
  }

  return (
    <ConfirmModal
      open={open}
      onClose={close}
      tone="danger"
      icon={<ExclamationOutlined />}
      title="¿Cancelar esta reserva?"
      description="Esta acción anula la reserva y el motivo queda registrado."
      confirmText="Cancelar reserva"
      cancelText="Volver"
      confirmDisabled={!reason.trim()}
      errorMessage="No se pudo cancelar la reserva."
      onConfirm={submit}
    >
      <ModalSummary>
        <ModalSummaryRow label="Cliente">
          {reservation.guest.name} {reservation.guest.last_name}
        </ModalSummaryRow>
        <ModalSummaryRow label="Habitación">
          {reservation.room.name}
        </ModalSummaryRow>
        <ModalSummaryRow label="Reserva"># {reservation.code}</ModalSummaryRow>
      </ModalSummary>

      <Input.TextArea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo de la cancelación (obligatorio)"
        maxLength={200}
        showCount
      />
    </ConfirmModal>
  )
}
