import { App } from 'antd'
import {
  CheckCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { receptionApi } from '@/features/reception/api/reception.api'
import {
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalSummaryCode,
  ModalNote,
} from '@/shared/components/Modal'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatStayDate } from '@/features/rooms/lib/stay'
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
} from '@/features/reception/lib/reservationStatus'
import type { Reservation } from '@/features/client/types'

export type TransitionAction = 'confirm' | 'check-in' | 'check-out'

interface ReservationTransitionModalProps {
  reservation: Reservation | null
  action: TransitionAction
  open: boolean
  onClose: () => void
  onDone: () => void
}

const COPY: Record<
  TransitionAction,
  {
    title: string
    description: string
    cta: string
    success: string
    note: string
    icon: ReactNode
  }
> = {
  confirm: {
    title: '¿Confirmar esta reserva?',
    description: 'La reserva pasará de pendiente a confirmada.',
    cta: 'Sí, confirmar reserva',
    success: 'Reserva confirmada. Se notificó al cliente.',
    note: 'El cliente recibirá un correo con la confirmación.',
    icon: <CheckCircleOutlined />,
  },
  'check-in': {
    title: '¿Registrar el check-in?',
    description: 'La habitación quedará marcada como ocupada.',
    cta: 'Sí, registrar check-in',
    success: 'Check-in registrado. La habitación quedó ocupada.',
    note: 'Recuerde solicitar el documento de identidad y entregar las llaves.',
    icon: <LoginOutlined />,
  },
  'check-out': {
    title: '¿Registrar el check-out?',
    description: 'La habitación quedará disponible para nuevas reservas.',
    cta: 'Sí, registrar check-out',
    success: 'Check-out registrado. La habitación quedó disponible.',
    note: 'Recuerde recibir las llaves y revisar la habitación.',
    icon: <LogoutOutlined />,
  },
}

/** HU-024 — Confirmación de las transiciones de estado desde el listado. */
export function ReservationTransitionModal({
  reservation,
  action,
  open,
  onClose,
  onDone,
}: ReservationTransitionModalProps) {
  const { message } = App.useApp()
  const copy = COPY[action]

  if (!reservation) return null

  const confirm = async () => {
    if (action === 'confirm') await receptionApi.confirm(reservation.id)
    else if (action === 'check-in') await receptionApi.checkIn(reservation.id)
    else await receptionApi.checkOut(reservation.id)
    message.success(copy.success)
    onDone()
  }

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      tone={action === 'check-out' ? 'info' : 'success'}
      icon={copy.icon}
      title={copy.title}
      description={copy.description}
      confirmText={copy.cta}
      cancelText="No, volver"
      width={500}
      errorMessage="No se pudo cambiar el estado."
      onConfirm={confirm}
    >
      <ModalSummary heading={`${reservation.guest.name} ${reservation.guest.last_name}`}>
        <ModalSummaryRow label="Habitación">
          {reservation.room.name}
        </ModalSummaryRow>
        <ModalSummaryRow label="Check-in">
          {formatStayDate(reservation.check_in)}
        </ModalSummaryRow>
        <ModalSummaryRow label="Check-out">
          {formatStayDate(reservation.check_out)}
        </ModalSummaryRow>
        <ModalSummaryRow label="Estado actual">
          <StatusTag tone={RESERVATION_STATUS_TONE[reservation.status]}>
            {RESERVATION_STATUS_LABEL[reservation.status]}
          </StatusTag>
        </ModalSummaryRow>
        <ModalSummaryCode code={reservation.code} />
      </ModalSummary>

      <ModalNote tone="info">{copy.note}</ModalNote>
    </ConfirmModal>
  )
}
