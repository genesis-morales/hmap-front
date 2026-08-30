import { App } from 'antd'
import { DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { roomsAdminApi } from '@/features/reception/api/roomsAdmin.api'
import {
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalNote,
} from '@/shared/components/Modal'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatMoney } from '@/features/rooms/lib/stay'
import { ROOM_STATUS_LABEL, ROOM_STATUS_TONE } from '@/features/reception/lib/roomStatus'
import type { Room } from '@/features/rooms/types'

interface DeleteRoomModalProps {
  room: Room | null
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

/** HU-028 — Eliminación de una habitación del inventario. */
export function DeleteRoomModal({
  room,
  open,
  onClose,
  onDeleted,
}: DeleteRoomModalProps) {
  const { message } = App.useApp()

  if (!room) return null

  const confirm = async () => {
    await roomsAdminApi.remove(room.id)
    message.success('Habitación eliminada.')
    onDeleted()
  }

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      tone="danger"
      icon={<DeleteOutlined />}
      title="¿Eliminar esta habitación?"
      description="Esta acción no se puede deshacer."
      confirmText="Sí, eliminar habitación"
      cancelText="No, mantener"
      stacked
      errorMessage="No se pudo eliminar la habitación."
      onConfirm={confirm}
    >
      <ModalSummary heading={room.name}>
        <ModalSummaryRow label="# Hab">{room.id}</ModalSummaryRow>
        <ModalSummaryRow label="Camas">{room.beds_label}</ModalSummaryRow>
        <ModalSummaryRow label="Capacidad">
          {room.capacity} personas
        </ModalSummaryRow>
        <ModalSummaryRow label="Tarifa">
          {formatMoney(room.price_per_night)} /noche
        </ModalSummaryRow>
        <ModalSummaryRow label="Estado">
          <StatusTag tone={ROOM_STATUS_TONE[room.status]}>
            {ROOM_STATUS_LABEL[room.status]}
          </StatusTag>
        </ModalSummaryRow>
      </ModalSummary>

      <ModalNote tone="warning" icon={<WarningOutlined />}>
        Solo se puede eliminar si la habitación no tiene reservas activas.
      </ModalNote>
    </ConfirmModal>
  )
}
