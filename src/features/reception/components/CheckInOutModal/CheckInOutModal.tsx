import { useEffect, useState } from 'react'
import { App, Button, Checkbox, Modal } from 'antd'
import { receptionApi } from '@/features/reception/api/reception.api'
import { getErrorMessage } from '@/shared/api/client'
import { UserAvatar } from '@/shared/components/UserAvatar/UserAvatar'
import { formatStayDate } from '@/features/rooms/lib/stay'
import type { Reservation } from '@/features/client/types'
import './CheckInOutModal.scss'

type Mode = 'check-in' | 'check-out'

interface CheckInOutModalProps {
  reservation: Reservation | null
  mode: Mode
  open: boolean
  onClose: () => void
  /** Se invoca tras completar la transición. */
  onDone: () => void
}

const COPY: Record<Mode, { title: string; badge: string; check: string; cta: string }> = {
  'check-in': {
    title: 'Registrar Check-in',
    badge: 'CHECK-IN',
    check: 'Documento de identidad verificado',
    cta: 'Confirmar check-in',
  },
  'check-out': {
    title: 'Registrar Check-out',
    badge: 'CHECK-OUT',
    check: 'Llaves entregadas a recepción',
    cta: 'Confirmar check-out',
  },
}

/** HU-019 — Registro físico de entrada/salida del huésped. */
export function CheckInOutModal({
  reservation,
  mode,
  open,
  onClose,
  onDone,
}: CheckInOutModalProps) {
  const { message } = App.useApp()
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const copy = COPY[mode]

  useEffect(() => {
    if (open) setChecked(false)
  }, [open])

  const confirm = async () => {
    if (!reservation) return
    setSaving(true)
    try {
      if (mode === 'check-in') {
        // El check-in exige estado CONFIRMADA; si sigue PENDIENTE, se confirma antes.
        if (reservation.status === 'PENDIENTE') {
          await receptionApi.confirm(reservation.id)
        }
        await receptionApi.checkIn(reservation.id)
        message.success('Check-in registrado. La habitación quedó ocupada.')
      } else {
        await receptionApi.checkOut(reservation.id)
        message.success('Check-out registrado. La habitación quedó disponible.')
      }
      onDone()
      onClose()
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo completar la operación.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={520} destroyOnHidden>
      {reservation && (
        <div className="checkinout-modal">
          <header className="checkinout-modal__head">
            <h3>{copy.title}</h3>
            <span className="checkinout-modal__badge">{copy.badge}</span>
            <span className="checkinout-modal__code">Reserva # {reservation.code}</span>
          </header>

          <div className="checkinout-modal__guest">
            <UserAvatar
              name={reservation.guest.name}
              lastName={reservation.guest.last_name}
              size={44}
            />
            <div>
              <strong>
                {reservation.guest.name} {reservation.guest.last_name}
              </strong>
              <span>{reservation.guest.email}</span>
            </div>
          </div>

          <dl className="checkinout-modal__details">
            <div>
              <dt>Habitación</dt>
              <dd>{reservation.room.name}</dd>
            </div>
            <div>
              <dt>Check-in</dt>
              <dd>{formatStayDate(reservation.check_in)}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>{formatStayDate(reservation.check_out)}</dd>
            </div>
            <div>
              <dt>Personas</dt>
              <dd>{reservation.guests}</dd>
            </div>
          </dl>

          <div className="checkinout-modal__verify">
            <span className="checkinout-modal__verify-title">Verificación</span>
            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
              {copy.check}
            </Checkbox>
          </div>

          <footer className="checkinout-modal__footer">
            <Button type="text" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="primary"
              className="btn-forest"
              disabled={!checked}
              loading={saving}
              onClick={confirm}
            >
              {copy.cta}
            </Button>
          </footer>
        </div>
      )}
    </Modal>
  )
}
