import { useCallback, useEffect, useState } from 'react'
import { Button, Skeleton } from 'antd'
import {
  CheckCircleOutlined,
  PlusOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/features/auth/context/AuthContext'
import { receptionApi } from '@/features/reception/api/reception.api'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { getErrorMessage } from '@/shared/api/client'
import { StatCard } from '@/features/reception/components/StatCard/StatCard'
import { PageHeader } from '@/features/reception/components/PageHeader/PageHeader'
import { GuestAvatar } from '@/features/reception/components/GuestAvatar/GuestAvatar'
import { ManualReservationModal } from '@/features/reception/components/ManualReservationModal/ManualReservationModal'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatLongDate } from '@/features/reception/lib/date'
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
} from '@/features/reception/lib/reservationStatus'
import { ROOM_STATUS_LABEL, ROOM_STATUS_TONE } from '@/features/reception/lib/roomStatus'
import type { Occupancy } from '@/features/reception/types'
import type { Reservation } from '@/features/client/types'
import type { Room } from '@/features/rooms/types'
import './OccupancyPanelPage.scss'

/** HU-016 — Panel de Ocupación (inicio del panel de recepción). */
export function OccupancyPanelPage() {
  const { user } = useAuth()
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null)
  const [checkIns, setCheckIns] = useState<Reservation[] | null>(null)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(() => {
    receptionApi.occupancy().then(setOccupancy).catch(() => setOccupancy(null))
    receptionApi
      .today()
      .then((t) => setCheckIns(t.check_ins))
      .catch((e) => setError(getErrorMessage(e)))
    roomsApi.list().then(setRooms).catch(() => setRooms([]))
  }, [])

  useEffect(load, [load])

  return (
    <div className="occupancy-panel">
      <PageHeader
        title="Panel de Ocupación"
        breadcrumb={[{ label: 'Inicio' }]}
        subtitle={
          <>
            Bienvenido, {user?.name} <span>•</span> {formatLongDate()}
          </>
        }
        actions={
          <Button
            type="primary"
            className="btn-cta"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Nueva reserva
          </Button>
        }
      />

      <section className="occupancy-panel__stats">
        {occupancy ? (
          <>
            <StatCard label="Total habitaciones" value={occupancy.total} />
            <StatCard
              label="Disponibles"
              value={occupancy.available}
              tone="success"
              icon={<CheckCircleOutlined />}
            />
            <StatCard
              label="Ocupadas"
              value={occupancy.occupied}
              tone="danger"
              icon={<TeamOutlined />}
            />
            <StatCard
              label="Mantenimiento"
              value={occupancy.maintenance}
              tone="warning"
              icon={<ToolOutlined />}
            />
          </>
        ) : (
          <Skeleton active paragraph={{ rows: 2 }} />
        )}
      </section>

      <div className="occupancy-panel__grid">
        <section className="occupancy-panel__card">
          <header className="occupancy-panel__card-header">
            <h2>Reservas de hoy</h2>
            {checkIns && (
              <span className="occupancy-panel__count">{checkIns.length} total</span>
            )}
          </header>

          {error && <p className="occupancy-panel__error">{error}</p>}
          {!error && checkIns === null && <Skeleton active paragraph={{ rows: 4 }} />}
          {checkIns && checkIns.length === 0 && (
            <p className="occupancy-panel__empty">No hay entradas programadas para hoy.</p>
          )}

          <ul className="occupancy-panel__list">
            {checkIns?.map((r) => (
              <li key={r.id} className="occupancy-panel__row">
                <GuestAvatar name={r.guest.name} lastName={r.guest.last_name} />
                <div className="occupancy-panel__row-info">
                  <strong>
                    {r.guest.name} {r.guest.last_name}
                  </strong>
                  <span>{r.room.name}</span>
                </div>
                <StatusTag tone={RESERVATION_STATUS_TONE[r.status]}>
                  {RESERVATION_STATUS_LABEL[r.status]}
                </StatusTag>
              </li>
            ))}
          </ul>

          <button
            className="occupancy-panel__card-footer"
            onClick={() => setModalOpen(true)}
          >
            <PlusOutlined /> Crear nueva reserva
          </button>
        </section>

        <section className="occupancy-panel__card">
          <header className="occupancy-panel__card-header">
            <h2>Estado de Habitaciones</h2>
          </header>

          {rooms === null && <Skeleton active paragraph={{ rows: 4 }} />}

          <ul className="occupancy-panel__list">
            {rooms?.map((room) => (
              <li key={room.id} className="occupancy-panel__room">
                <div className="occupancy-panel__room-info">
                  <strong>{room.name}</strong>
                  <span>{room.beds_label}</span>
                </div>
                <StatusTag tone={ROOM_STATUS_TONE[room.status]}>
                  {ROOM_STATUS_LABEL[room.status]}
                </StatusTag>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ManualReservationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </div>
  )
}
