import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from 'antd'
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SwapOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { Table, type Column } from '@/shared/components/Table/Table'
import { StatCard } from '@/shared/components/StatCard/StatCard'
import { RoomFormModal } from '@/features/reception/components/RoomFormModal/RoomFormModal'
import { DeleteRoomModal } from '@/features/reception/components/DeleteRoomModal/DeleteRoomModal'
import { RoomStatusModal } from '@/features/reception/components/RoomStatusModal/RoomStatusModal'
import { PageHeader } from '@/shared/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatMoney } from '@/features/rooms/lib/stay'
import {
  ROOM_STATUS_LABEL,
  ROOM_STATUS_TONE,
} from '@/features/reception/lib/roomStatus'
import type { Room, RoomStatus } from '@/features/rooms/types'
import './RoomsPage.scss'

const TABS: { key: string; label: string; status?: RoomStatus }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'DISPONIBLE', label: 'Disponibles', status: 'DISPONIBLE' },
  { key: 'OCUPADA', label: 'Ocupadas', status: 'OCUPADA' },
  { key: 'MANTENIMIENTO', label: 'Mantenimiento', status: 'MANTENIMIENTO' },
]

/** HU-025 → HU-029 — Inventario de habitaciones. */
export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [tab, setTab] = useState('TODAS')
  const [form, setForm] = useState<{ open: boolean; room: Room | null }>({
    open: false,
    room: null,
  })
  const [statusModal, setStatusModal] = useState<Room | null>(null)
  const [deleteModal, setDeleteModal] = useState<Room | null>(null)

  const load = useCallback(() => {
    setRooms(null)
    roomsApi.list().then(setRooms).catch(() => setRooms([]))
  }, [])

  useEffect(load, [load])

  const filterStatus = TABS.find((t) => t.key === tab)?.status
  const filtered = useMemo(
    () => (rooms ?? []).filter((r) => (filterStatus ? r.status === filterStatus : true)),
    [rooms, filterStatus],
  )

  const counts = useMemo(() => {
    const all = rooms ?? []
    return {
      available: all.filter((r) => r.status === 'DISPONIBLE').length,
      occupied: all.filter((r) => r.status === 'OCUPADA').length,
      maintenance: all.filter((r) => r.status === 'MANTENIMIENTO').length,
      total: all.length,
    }
  }, [rooms])

  const columns: Column<Room>[] = [
    {
      key: 'id',
      header: '# Hab',
      render: (r) => <span className="rooms-admin__id">{r.id}</span>,
    },
    {
      key: 'room_number',
      header: 'Número',
      render: (r) => <span className="rooms-admin__room-number">{r.room_number}</span>
    },
    { key: 'name', header: 'Habitación', render: (r) => r.name },
    { key: 'beds', header: 'Camas', render: (r) => r.beds_label },
    {
      key: 'capacity',
      header: 'Capacidad',
      render: (r) => `${r.capacity} personas`,
    },
    {
      key: 'price',
      header: 'Tarifa',
      render: (r) => (
        <span className="rooms-admin__price">
          {formatMoney(r.price_per_night)} <small>/noche</small>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => (
        <StatusTag tone={ROOM_STATUS_TONE[r.status]}>
          {ROOM_STATUS_LABEL[r.status]}
        </StatusTag>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (r) => (
        <div className="rooms-admin__actions">
          <button
            className="rooms-admin__icon rooms-admin__icon--edit"
            title="Editar"
            onClick={() => setForm({ open: true, room: r })}
          >
            <EditOutlined />
          </button>
          <button
            className="rooms-admin__icon"
            title="Cambiar estado"
            onClick={() => setStatusModal(r)}
          >
            <SwapOutlined />
          </button>
          <button
            className="rooms-admin__icon rooms-admin__icon--delete"
            title="Eliminar"
            onClick={() => setDeleteModal(r)}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="rooms-admin">
      <PageHeader
        title="Habitaciones"
        breadcrumb={[
          { label: 'Inicio', to: '/panel-reception' },
          { label: 'Habitaciones' },
        ]}
        actions={
          <Button
            type="primary"
            className="btn-cta"
            icon={<PlusOutlined />}
            onClick={() => setForm({ open: true, room: null })}
          >
            Nueva habitación
          </Button>
        }
      />

      <nav className="rooms-admin__tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'rooms-admin__tab--active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <Table
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        loading={rooms === null}
        emptyText="No hay habitaciones para este filtro."
      />

      <footer className="rooms-admin__footer">
        Mostrando {filtered.length} de {rooms?.length ?? 0}{' '}
        {(rooms?.length ?? 0) === 1 ? 'habitación' : 'habitaciones'}
      </footer>

      <section className="rooms-admin__stats">
        <StatCard variant="boxed" tone="success" label="Disponibles" value={counts.available} icon={<CheckCircleOutlined />} />
        <StatCard variant="boxed" tone="warning" label="Ocupadas" value={counts.occupied} icon={<TeamOutlined />} />
        <StatCard variant="boxed" tone="danger" label="Mantenimiento" value={counts.maintenance} icon={<ToolOutlined />} />
        <StatCard variant="boxed" tone="neutral" label="Total de hab." value={counts.total} icon={<TeamOutlined />} />
      </section>

      <RoomFormModal
        room={form.room}
        open={form.open}
        onClose={() => setForm({ open: false, room: null })}
        onSaved={load}
      />

      <RoomStatusModal
        room={statusModal}
        open={statusModal !== null}
        onClose={() => setStatusModal(null)}
        onChanged={load}
      />

      <DeleteRoomModal
        room={deleteModal}
        open={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onDeleted={load}
      />
    </div>
  )
}
