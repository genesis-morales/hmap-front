import { useCallback, useEffect, useState } from 'react'
import { App, Button, DatePicker, Dropdown, Pagination } from 'antd'
import {
  CalendarOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { receptionApi } from '@/features/reception/api/reception.api'
import { getErrorMessage } from '@/shared/api/client'
import { Table, type Column } from '@/shared/components/Table/Table'
import { StatCard } from '@/features/reception/components/StatCard/StatCard'
import { GuestAvatar } from '@/features/reception/components/GuestAvatar/GuestAvatar'
import { ManualReservationModal } from '@/features/reception/components/ManualReservationModal/ManualReservationModal'
import { CancelReservationModal } from '@/features/reception/components/CancelReservationModal/CancelReservationModal'
import { EditReservationModal } from '@/features/reception/components/EditReservationModal/EditReservationModal'
import { PageHeader } from '@/features/reception/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatStayDate, API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
} from '@/features/reception/lib/reservationStatus'
import type { Reservation, ReservationStatus } from '@/features/client/types'
import type { PageResponse } from '@/features/reception/types'
import './ReservationsPage.scss'

const { RangePicker } = DatePicker
const PAGE_SIZE = 5

const TABS: { key: string; label: string; status?: ReservationStatus }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'CONFIRMADA', label: 'Confirmadas', status: 'CONFIRMADA' },
  { key: 'PENDIENTE', label: 'Pendientes', status: 'PENDIENTE' },
  { key: 'CANCELADA', label: 'Canceladas', status: 'CANCELADA' },
]

/** HU-024 — Listado completo de reservas con filtros y paginación. */
export function ReservationsPage() {
  const { message } = App.useApp()
  const [tab, setTab] = useState('TODAS')
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<PageResponse<Reservation> | null>(null)
  const [counts, setCounts] = useState({ confirmed: 0, pending: 0, cancelled: 0, today: 0 })

  const [newOpen, setNewOpen] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [cancelling, setCancelling] = useState<Reservation | null>(null)

  const status = TABS.find((t) => t.key === tab)?.status

  const load = useCallback(() => {
    setResult(null)
    receptionApi
      .listReservations({
        status,
        from: range?.[0].format(API_DATE_FORMAT),
        to: range?.[1].format(API_DATE_FORMAT),
        page,
        size: PAGE_SIZE,
      })
      .then(setResult)
      .catch(() => setResult({ content: [], page: 0, size: PAGE_SIZE, total_elements: 0, total_pages: 0 }))
  }, [status, range, page])

  useEffect(load, [load])

  const loadCounts = useCallback(() => {
    Promise.all([
      receptionApi.listReservations({ status: 'CONFIRMADA', size: 1 }),
      receptionApi.listReservations({ status: 'PENDIENTE', size: 1 }),
      receptionApi.listReservations({ status: 'CANCELADA', size: 1 }),
      receptionApi.today(),
    ])
      .then(([c, p, x, today]) =>
        setCounts({
          confirmed: c.total_elements,
          pending: p.total_elements,
          cancelled: x.total_elements,
          today: today.check_ins.length + today.check_outs.length,
        }),
      )
      .catch(() => undefined)
  }, [])

  useEffect(loadCounts, [loadCounts])

  const refresh = () => {
    load()
    loadCounts()
  }

  /** Ejecuta una transición de estado y refresca el listado. */
  const transition = async (
    r: Reservation,
    action: 'confirm' | 'check-in' | 'check-out',
  ) => {
    try {
      if (action === 'confirm') await receptionApi.confirm(r.id)
      else if (action === 'check-in') await receptionApi.checkIn(r.id)
      else await receptionApi.checkOut(r.id)
      message.success('Estado de la reserva actualizado.')
      refresh()
    } catch (error) {
      message.error(getErrorMessage(error, 'No se pudo cambiar el estado.'))
    }
  }

  /** Transiciones válidas según el estado actual de la reserva. */
  const transitionsFor = (r: Reservation) => {
    switch (r.status) {
      case 'PENDIENTE':
        return [{ key: 'confirm', label: 'Confirmar reserva', run: () => transition(r, 'confirm') }]
      case 'CONFIRMADA':
        return [{ key: 'check-in', label: 'Registrar check-in', run: () => transition(r, 'check-in') }]
      case 'CHECK_IN':
        return [{ key: 'check-out', label: 'Registrar check-out', run: () => transition(r, 'check-out') }]
      default:
        return []
    }
  }

  const columns: Column<Reservation>[] = [
    {
      key: 'code',
      header: '# Reserva',
      render: (r) => <span className="reservations__code">{r.code}</span>,
    },
    {
      key: 'guest',
      header: 'Huésped',
      render: (r) => (
        <div className="reservations__guest">
          <GuestAvatar name={r.guest.name} lastName={r.guest.last_name} />
          <span>
            {r.guest.name} {r.guest.last_name}
          </span>
        </div>
      ),
    },
    { key: 'room', header: 'Habitación', render: (r) => r.room.name },
    { key: 'in', header: 'Check-in', render: (r) => formatStayDate(r.check_in) },
    { key: 'out', header: 'Check-out', render: (r) => formatStayDate(r.check_out) },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => (
        <StatusTag tone={RESERVATION_STATUS_TONE[r.status]}>
          {RESERVATION_STATUS_LABEL[r.status]}
        </StatusTag>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (r) => {
        const active = r.status === 'PENDIENTE' || r.status === 'CONFIRMADA'
        const transitions = transitionsFor(r)
        return (
          <div className="reservations__actions">
            {transitions.length > 0 && (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: transitions.map((t) => ({
                    key: t.key,
                    label: t.label,
                    onClick: t.run,
                  })),
                }}
              >
                <button
                  className="reservations__icon reservations__icon--state"
                  title="Cambiar estado"
                >
                  <MoreOutlined />
                </button>
              </Dropdown>
            )}
            <button
              className="reservations__icon reservations__icon--edit"
              disabled={!active}
              title="Editar"
              onClick={() => setEditing(r)}
            >
              <EditOutlined />
            </button>
            <button
              className="reservations__icon reservations__icon--delete"
              disabled={!active}
              title="Cancelar"
              onClick={() => setCancelling(r)}
            >
              <DeleteOutlined />
            </button>
          </div>
        )
      },
    },
  ]

  const total = result?.total_elements ?? 0

  return (
    <div className="reservations">
      <PageHeader
        title="Reservas"
        breadcrumb={[
          { label: 'Inicio', to: '/panel-reception' },
          { label: 'Reservas' },
        ]}
        actions={
          <Button
            type="primary"
            className="btn-cta"
            icon={<PlusOutlined />}
            onClick={() => setNewOpen(true)}
          >
            Nueva reserva
          </Button>
        }
      />

      <div className="reservations__toolbar">
        <nav className="reservations__tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? 'reservations__tab--active' : ''}
              onClick={() => {
                setTab(t.key)
                setPage(0)
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <RangePicker
          value={range}
          onChange={(v) => {
            setRange(v as [Dayjs, Dayjs] | null)
            setPage(0)
          }}
          format="DD/MM/YYYY"
        />
      </div>

      <Table
        columns={columns}
        rows={result?.content ?? []}
        rowKey={(r) => r.id}
        loading={result === null}
        emptyText="No hay reservas para estos filtros."
      />

      <footer className="reservations__footer">
        <span>
          Mostrando {result?.content.length ?? 0} de {total}{' '}
          {total === 1 ? 'reserva' : 'reservas'}
        </span>
        <Pagination
          current={page + 1}
          pageSize={PAGE_SIZE}
          total={total}
          showSizeChanger={false}
          onChange={(p) => setPage(p - 1)}
        />
      </footer>

      <section className="reservations__stats">
        <StatCard variant="boxed" tone="success" label="Confirmadas" value={counts.confirmed} icon={<CalendarOutlined />} />
        <StatCard variant="boxed" tone="warning" label="Pendientes" value={counts.pending} icon={<CalendarOutlined />} />
        <StatCard variant="boxed" tone="danger" label="Canceladas" value={counts.cancelled} icon={<CloseCircleOutlined />} />
        <StatCard variant="boxed" tone="neutral" label="Movimientos hoy" value={counts.today} icon={<TeamOutlined />} />
      </section>

      <ManualReservationModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={refresh} />
      <EditReservationModal
        reservation={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />
      <CancelReservationModal
        reservation={cancelling}
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        onCancelled={refresh}
      />
    </div>
  )
}
