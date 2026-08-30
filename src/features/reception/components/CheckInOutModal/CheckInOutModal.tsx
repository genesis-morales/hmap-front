import { type ReactNode } from 'react'
import { App } from 'antd'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { receptionApi } from '@/features/reception/api/reception.api'
import {
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalSummaryCode,
} from '@/shared/components/Modal'
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

const COPY: Record<
  Mode,
  { title: string; reminders: string[]; cta: string; success: string; icon: ReactNode }
> = {
  'check-in': {
    title: 'Registrar Check-in',
    reminders: [
      'El cliente debe presentar su documento de identidad.',
      'Entregar las llaves de la habitación.',
      'Informar el horario del desayuno y la hora de salida.',
    ],
    cta: 'Confirmar check-in',
    success: 'Check-in registrado. La habitación quedó ocupada.',
    icon: <LoginOutlined />,
  },
  'check-out': {
    title: 'Registrar Check-out',
    reminders: [
      'El cliente debe entregar las llaves en recepción.',
      'Revisar la habitación antes de liberarla.',
      'Confirmar que no queden consumos pendientes.',
    ],
    cta: 'Confirmar check-out',
    success: 'Check-out registrado. La habitación quedó disponible.',
    icon: <LogoutOutlined />,
  },
}

/** HU-019 — Registro físico de entrada/salida del cliente. */
export function CheckInOutModal({
  reservation,
  mode,
  open,
  onClose,
  onDone,
}: CheckInOutModalProps) {
  const { message } = App.useApp()
  const copy = COPY[mode]

  const confirm = async () => {
    if (!reservation) return
    if (mode === 'check-in') {
      // El check-in exige estado CONFIRMADA; si sigue PENDIENTE, se confirma antes.
      if (reservation.status === 'PENDIENTE') {
        await receptionApi.confirm(reservation.id)
      }
      await receptionApi.checkIn(reservation.id)
    } else {
      await receptionApi.checkOut(reservation.id)
    }
    message.success(copy.success)
    onDone()
  }

  if (!reservation) return null

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      tone={mode === 'check-in' ? 'success' : 'info'}
      icon={copy.icon}
      title={copy.title}
      confirmText={copy.cta}
      width={520}
      errorMessage="No se pudo completar la operación."
      onConfirm={confirm}
    >
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

      <ModalSummary>
        <ModalSummaryRow label="Habitación">
          {reservation.room.name}
        </ModalSummaryRow>
        <ModalSummaryRow label="Check-in">
          {formatStayDate(reservation.check_in)}
        </ModalSummaryRow>
        <ModalSummaryRow label="Check-out">
          {formatStayDate(reservation.check_out)}
        </ModalSummaryRow>
        <ModalSummaryRow label="Personas">{reservation.guests}</ModalSummaryRow>
        <ModalSummaryCode code={reservation.code} />
      </ModalSummary>

      <div className="checkinout-modal__reminders">
        <span className="checkinout-modal__reminders-title">
          Breve recordatorio
        </span>
        <ul>
          {copy.reminders.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </ConfirmModal>
  )
}
