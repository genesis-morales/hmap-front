import { useEffect, useState } from 'react'
import { App, Input, Modal } from 'antd'
import { receptionApi } from '@/features/reception/api/reception.api'
import { getErrorMessage } from '@/shared/api/client'
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  const submit = async () => {
    if (!reservation) return
    if (!reason.trim()) {
      message.warning('Indica el motivo de la cancelación.')
      return
    }
    setSaving(true)
    try {
      await receptionApi.cancel(reservation.id, reason.trim())
      message.success('Reserva cancelada. Se notificó al huésped.')
      onCancelled()
      onClose()
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo cancelar la reserva.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="Cancelar reserva"
      cancelText="Volver"
      okButtonProps={{ danger: true }}
      confirmLoading={saving}
      title={`Cancelar reserva ${reservation?.code ?? ''}`}
      destroyOnHidden
    >
      <p style={{ marginBottom: 12, color: '#8a8578' }}>
        Esta acción anula la reserva de{' '}
        <strong>
          {reservation?.guest.name} {reservation?.guest.last_name}
        </strong>
        . El motivo queda registrado.
      </p>
      <Input.TextArea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo de la cancelación (obligatorio)"
        maxLength={200}
        showCount
      />
    </Modal>
  )
}
