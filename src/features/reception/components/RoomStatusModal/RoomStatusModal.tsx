import { useState } from 'react'
import { App, Select } from 'antd'
import { InfoCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { roomsAdminApi } from '@/features/reception/api/roomsAdmin.api'
import {
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalNote,
} from '@/shared/components/Modal'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import {
  ROOM_STATUSES,
  ROOM_STATUS_LABEL,
  ROOM_STATUS_TONE,
} from '@/features/reception/lib/roomStatus'
import type { Room, RoomStatus } from '@/features/rooms/types'
import './RoomStatusModal.scss'

interface RoomStatusModalProps {
  room: Room | null
  open: boolean
  onClose: () => void
  onChanged: () => void
}

/** HU-027 — Cambio de estado operativo de una habitación. */
export function RoomStatusModal({
  room,
  open,
  onClose,
  onChanged,
}: RoomStatusModalProps) {
  const { message } = App.useApp()
  const [status, setStatus] = useState<RoomStatus | undefined>()

  // El selector se limpia al cerrar; destroyOnHidden desmonta el contenido.
  const close = () => {
    setStatus(undefined)
    onClose()
  }

  if (!room) return null

  const confirm = async () => {
    if (!status) return
    await roomsAdminApi.setStatus(room.id, status)
    message.success(
      `Estado actualizado a ${ROOM_STATUS_LABEL[status].toLowerCase()}.`,
    )
    onChanged()
    setStatus(undefined)
  }

  return (
    <ConfirmModal
      open={open}
      onClose={close}
      tone="info"
      icon={<SwapOutlined />}
      title="Cambiar estado de habitación"
      description="El estado define si la habitación admite nuevas reservas."
      confirmText="Guardar estado"
      confirmDisabled={!status}
      errorMessage="No se pudo cambiar el estado."
      onConfirm={confirm}
    >
      <ModalSummary heading={room.name}>
        <ModalSummaryRow label="# Hab">{room.id}</ModalSummaryRow>
        <ModalSummaryRow label="Estado actual">
          <StatusTag tone={ROOM_STATUS_TONE[room.status]}>
            {ROOM_STATUS_LABEL[room.status]}
          </StatusTag>
        </ModalSummaryRow>
      </ModalSummary>

      <label className="room-status-modal__field">
        <span>Nuevo estado</span>
        <Select
          value={status}
          onChange={setStatus}
          placeholder="Selecciona un estado"
          options={ROOM_STATUSES.filter((s) => s !== room.status).map((s) => ({
            value: s,
            label: ROOM_STATUS_LABEL[s],
          }))}
        />
      </label>

      {status === 'MANTENIMIENTO' && (
        <ModalNote tone="warning" icon={<InfoCircleOutlined />}>
          En mantenimiento la habitación deja de aparecer en las búsquedas de
          disponibilidad.
        </ModalNote>
      )}
    </ConfirmModal>
  )
}
