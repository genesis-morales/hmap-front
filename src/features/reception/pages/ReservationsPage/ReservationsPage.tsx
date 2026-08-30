import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, DatePicker, Dropdown, Pagination, Select } from 'antd'
import {
  CalendarOutlined,
  CloseCircleOutlined,
  EditOutlined,
  GlobalOutlined,
  MoreOutlined,
  PlusOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { receptionApi } from '@/features/reception/api/reception.api'
import { Table, type Column } from '@/shared/components/Table/Table'
import { StatCard } from '@/shared/components/StatCard/StatCard'
import { UserAvatar } from '@/shared/components/UserAvatar/UserAvatar'
import { ManualReservationModal } from '@/features/reception/components/ManualReservationModal/ManualReservationModal'
import { CancelReservationModal } from '@/features/reception/components/CancelReservationModal/CancelReservationModal'
import { EditReservationModal } from '@/features/reception/components/EditReservationModal/EditReservationModal'
import {
  ReservationTransitionModal,
  type TransitionAction,
} from '@/features/reception/components/ReservationTransitionModal/ReservationTransitionModal'
import { PageHeader } from '@/shared/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatStayDate, API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
  RESERVATION_TYPE_LABEL,
  RESERVATION_TYPE_TONE,
} from '@/features/reception/lib/reservationStatus'
import type {
  Reservation,
  ReservationStatus,
  ReservationType,
} from '@/features/client/types'
import type { PageResponse } from '@/features/reception/types'
import './ReservationsPage.scss'

const { RangePicker } = DatePicker
const PAGE_SIZE = 5
/**
 * Techo al traer el conjunto para filtrar/contar por origen en el cliente.
 * La API rechaza `size` > 100 devolviendo una respuesta vacía, así que 100 es
 * el máximo utilizable. Provisional: cuando la API acepte `type`, se elimina.
 */
const MAX_CLIENT_FILTER = 100

const TABS: { key: string; label: string; status?: ReservationStatus }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'CONFIRMADA', label: 'Confirmadas', status: 'CONFIRMADA' },
  { key: 'PENDIENTE', label: 'Pendientes', status: 'PENDIENTE' },
  { key: 'CANCELADA', label: 'Canceladas', status: 'CANCELADA' },
]

/** HU-024 — Listado completo de reservas con filtros y paginación. */
export function ReservationsPage() {
  const [tab, setTab] = useState('TODAS')
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null)
  /** El backend ignora `type`, así que el origen se filtra en el cliente. */
  const [typeFilter, setTypeFilter] = useState<ReservationType | 'TODOS'>('TODOS')
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<PageResponse<Reservation> | null>(null)
  const [counts, setCounts] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    today: 0,
    online: 0,
    manual: 0,
  })

  /** El conjunto para filtrar/contar por origen excedió el techo de la API. */
  const [truncated, setTruncated] = useState(false)

  const [newOpen, setNewOpen] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [cancelling, setCancelling] = useState<Reservation | null>(null)
  const [transition, setTransition] = useState<{
    reservation: Reservation
    action: TransitionAction
  } | null>(null)

  const status = TABS.find((t) => t.key === tab)?.status

  const load = useCallback(() => {
    setResult(null)
    const base = {
      status,
      from: range?.[0].format(API_DATE_FORMAT),
      to: range?.[1].format(API_DATE_FORMAT),
    }
    const fallback = {
      content: [],
      page: 0,
      size: PAGE_SIZE,
      total_elements: 0,
      total_pages: 0,
    }

    // Sin filtro de origen se pagina en el servidor. Con filtro hay que traer el
    // conjunto y paginar aquí, porque la API no soporta `type` (ver docs §10).
    if (typeFilter === 'TODOS') {
      setTruncated(false)
      receptionApi
        .listReservations({ ...base, page, size: PAGE_SIZE })
        .then(setResult)
        .catch(() => setResult(fallback))
      return
    }

    receptionApi
      .listReservations({ ...base, page: 0, size: MAX_CLIENT_FILTER })
      .then((all) => {
        const matching = all.content.filter((r) => r.type === typeFilter)
        // Si la API tenía más de lo que caben en una página, el filtro no vio
        // el conjunto completo y el total mostrado queda corto.
        setTruncated(all.total_elements > all.content.length)
        setResult({
          content: matching.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
          page,
          size: PAGE_SIZE,
          total_elements: matching.length,
          total_pages: Math.max(1, Math.ceil(matching.length / PAGE_SIZE)),
        })
      })
      .catch(() => setResult(fallback))
  }, [status, range, page, typeFilter])

  useEffect(load, [load])

  const loadCounts = useCallback(() => {
    Promise.all([
      receptionApi.listReservations({ status: 'CONFIRMADA', size: 1 }),
      receptionApi.listReservations({ status: 'PENDIENTE', size: 1 }),
      receptionApi.listReservations({ status: 'CANCELADA', size: 1 }),
      receptionApi.today(),
      // El backend no filtra por `type`: se traen todas y se cuentan aquí.
      receptionApi.listReservations({ size: MAX_CLIENT_FILTER }),
    ])
      .then(([c, p, x, today, all]) => {
        // Los conteos por origen sufren el mismo techo que el filtro.
        if (all.total_elements > all.content.length) setTruncated(true)
        setCounts({
          confirmed: c.total_elements,
          pending: p.total_elements,
          cancelled: x.total_elements,
          today: today.check_ins.length + today.check_outs.length,
          online: all.content.filter((r) => r.type === 'ONLINE').length,
          manual: all.content.filter((r) => r.type === 'MANUAL').length,
        })
      })
      .catch(() => undefined)
  }, [])

  useEffect(loadCounts, [loadCounts])

  const refresh = () => {
    load()
    loadCounts()
  }

  /** Transiciones válidas según el estado actual de la reserva. */
  const transitionsFor = (r: Reservation) => {
    switch (r.status) {
      case 'PENDIENTE':
        return [
          {
            key: 'confirm',
            label: 'Confirmar reserva',
            run: () => setTransition({ reservation: r, action: 'confirm' }),
          },
        ]
      case 'CONFIRMADA':
        return [
          {
            key: 'check-in',
            label: 'Registrar check-in',
            run: () => setTransition({ reservation: r, action: 'check-in' }),
          },
        ]
      case 'CHECK_IN':
        return [
          {
            key: 'check-out',
            label: 'Registrar check-out',
            run: () => setTransition({ reservation: r, action: 'check-out' }),
          },
        ]
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
          <UserAvatar name={r.guest.name} lastName={r.guest.last_name} />
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
      key: 'type',
      header: 'Origen',
      render: (r) => (
        <StatusTag tone={RESERVATION_TYPE_TONE[r.type]}>
          {RESERVATION_TYPE_LABEL[r.type]}
        </StatusTag>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (r) => {
        // Editar solo antes de la estancia; cancelar también durante ella.
        const editable = r.status === 'PENDIENTE' || r.status === 'CONFIRMADA'
        const cancellable = editable || r.status === 'CHECK_IN'
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
              disabled={!editable}
              title="Editar reserva"
              onClick={() => setEditing(r)}
            >
              <EditOutlined />
            </button>
            <button
              className="reservations__icon reservations__icon--delete"
              disabled={!cancellable}
              title="Cancelar reserva"
              onClick={() => setCancelling(r)}
            >
              <CloseCircleOutlined />
            </button>
          </div>
        )
      },
    },
  ]

  const total = result?.total_elements ?? 0
  const rows = result?.content ?? []

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
        <div className="reservations__filters">
          <Select
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v)
              setPage(0)
            }}
            style={{ width: 170 }}
            options={[
              { value: 'TODOS', label: 'Todo origen' },
              { value: 'ONLINE', label: 'En línea' },
              { value: 'MANUAL', label: 'Manual' },
            ]}
          />
          <RangePicker
            value={range}
            onChange={(v) => {
              setRange(v as [Dayjs, Dayjs] | null)
              setPage(0)
            }}
            format="DD/MM/YYYY"
          />
        </div>
      </div>

      {truncated && (
        <Alert
          type="warning"
          showIcon
          className="reservations__truncated"
          message={`Hay más de ${MAX_CLIENT_FILTER} reservas registradas.`}
          description={
            'El filtro y los contadores por origen se calculan sobre las primeras ' +
            `${MAX_CLIENT_FILTER}, así que pueden quedar incompletos. Use las ` +
            'pestañas de estado o el rango de fechas para acotar la búsqueda.'
          }
        />
      )}

      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={result === null}
        emptyText="No hay reservas para estos filtros."
      />

      <footer className="reservations__footer">
        <span>
          Mostrando {rows.length} de {total}{' '}
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
        <StatCard variant="boxed" tone="warning" label="Reservas en línea" value={counts.online} icon={<GlobalOutlined />} />
        <StatCard variant="boxed" tone="neutral" label="Reservas manuales" value={counts.manual} icon={<ShopOutlined />} />
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
      <ReservationTransitionModal
        reservation={transition?.reservation ?? null}
        action={transition?.action ?? 'confirm'}
        open={transition !== null}
        onClose={() => setTransition(null)}
        onDone={refresh}
      />
    </div>
  )
}
