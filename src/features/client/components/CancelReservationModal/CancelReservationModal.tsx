import { useState } from 'react'
import { App, Button, Modal } from 'antd'
import { CalendarOutlined, ExclamationOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { getErrorMessage } from '@/shared/api/client'
import { formatStayRange, nightsLabel } from '@/features/rooms/lib/stay'
import type { Reservation } from '@/features/client/types'
import './CancelReservationModal.scss'

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
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setLoading(true)
    try {
      const updated = await reservationsApi.cancel(reservation.id)
      message.success('Reserva cancelada. Te enviamos un correo de confirmación.')
      onCancelled(updated)
      onClose()
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo cancelar la reserva.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={480}>
      <div className="cancel-reservation">
        <span className="cancel-reservation__icon">
          <ExclamationOutlined />
        </span>
        <h2>¿Cancelar esta reserva?</h2>
        <p className="cancel-reservation__warning">
          Esta acción no se puede deshacer.
        </p>

        <div className="cancel-reservation__summary">
          <h3>{reservation.room.name}</h3>
          <p>
            <CalendarOutlined />{' '}
            {formatStayRange(reservation.check_in, reservation.check_out)} ·{' '}
            {nightsLabel(reservation.nights)}
          </p>
          <div className="cancel-reservation__code">
            <span>Reserva</span>
            <strong># {reservation.code}</strong>
          </div>
        </div>

        <p className="cancel-reservation__note">
          <InfoCircleOutlined /> Se enviará un correo de confirmación de
          cancelación a tu correo registrado.
        </p>

        <Button
          danger
          type="primary"
          block
          className="cancel-reservation__confirm"
          onClick={confirm}
          loading={loading}
        >
          Sí, cancelar reserva
        </Button>
        <Button block onClick={onClose} disabled={loading}>
          No, mantener reserva
        </Button>
      </div>
    </Modal>
  )
}
