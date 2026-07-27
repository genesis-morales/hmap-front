import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, DatePicker, Input, Select } from 'antd'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { receptionApi } from '@/features/reception/api/reception.api'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { Table, type Column } from '@/shared/components/Table/Table'
import { GuestAvatar } from '@/features/reception/components/GuestAvatar/GuestAvatar'
import { CancelReservationModal } from '@/features/reception/components/CancelReservationModal/CancelReservationModal'
import { EditReservationModal } from '@/features/reception/components/EditReservationModal/EditReservationModal'
import { PageHeader } from '@/features/reception/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { formatStayDate, API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import {
  FILTERABLE_STATUSES,
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
} from '@/features/reception/lib/reservationStatus'
import type { Reservation, ReservationStatus } from '@/features/client/types'
import type { Room } from '@/features/rooms/types'
import './SearchReservationPage.scss'

const { RangePicker } = DatePicker

/** Resalta la coincidencia del término dentro de un texto. */
function highlight(text: string, term: string) {
  if (!term.trim()) return text
  const idx = text.toLowerCase().indexOf(term.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  )
}

/** HU-023 — Búsqueda rápida de reservas por huésped, código o fechas. */
export function SearchReservationPage() {
  const [params] = useSearchParams()
  const initialQuery = params.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [applied, setApplied] = useState(initialQuery)
  const [status, setStatus] = useState<ReservationStatus | undefined>()
  const [roomId, setRoomId] = useState<number | undefined>()
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null)

  const [rooms, setRooms] = useState<Room[]>([])
  const [results, setResults] = useState<Reservation[] | null>(null)

  const [editing, setEditing] = useState<Reservation | null>(null)
  const [cancelling, setCancelling] = useState<Reservation | null>(null)

  useEffect(() => {
    roomsApi.list().then(setRooms).catch(() => setRooms([]))
  }, [])

  // Si la barra superior manda una nueva búsqueda (?q=), la aplica.
  useEffect(() => {
    setQuery(initialQuery)
    setApplied(initialQuery)
  }, [initialQuery])

  const load = useCallback(() => {
    setResults(null)
    receptionApi
      .listReservations({
        search: applied || undefined,
        status,
        from: range?.[0].format(API_DATE_FORMAT),
        to: range?.[1].format(API_DATE_FORMAT),
        size: 50,
      })
      .then((res) => setResults(res.content))
      .catch(() => setResults([]))
  }, [applied, status, range])

  useEffect(load, [load])

  // El filtro por habitación no existe en la API: se aplica sobre los resultados.
  const rows = useMemo(
    () => (results ?? []).filter((r) => (roomId ? r.room.id === roomId : true)),
    [results, roomId],
  )

  const runSearch = () => setApplied(query.trim())

  const clear = () => {
    setQuery('')
    setApplied('')
    setStatus(undefined)
    setRoomId(undefined)
    setRange(null)
  }

  const columns: Column<Reservation>[] = [
    {
      key: 'code',
      header: '# Reserva',
      render: (r) => <span className="search-reservation__code">{r.code}</span>,
    },
    {
      key: 'guest',
      header: 'Huésped',
      render: (r) => (
        <div className="search-reservation__guest">
          <GuestAvatar name={r.guest.name} lastName={r.guest.last_name} />
          <span>{highlight(`${r.guest.name} ${r.guest.last_name}`, applied)}</span>
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
        return (
          <div className="search-reservation__actions">
            <button disabled={!active} title="Editar" onClick={() => setEditing(r)}>
              <EditOutlined />
            </button>
            <button
              disabled={!active}
              title="Cancelar"
              className="search-reservation__delete"
              onClick={() => setCancelling(r)}
            >
              <DeleteOutlined />
            </button>
          </div>
        )
      },
    },
  ]

  const refresh = () => load()

  return (
    <div className="search-reservation">
      <PageHeader
        title="Buscar reserva"
        breadcrumb={[
          { label: 'Inicio', to: '/panel-reception' },
          { label: 'Buscar reserva' },
        ]}
        subtitle="Gestione y localice estancias de huéspedes rápidamente."
      />

      <div className="search-reservation__searchbar">
        <Input
          size="large"
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={runSearch}
          placeholder="Nombre, correo o código (RSV-000123)"
          allowClear
        />
        <Button type="primary" size="large" className="btn-cta" onClick={runSearch}>
          Buscar
        </Button>
      </div>

      <div className="search-reservation__filters">
        <label>
          <span>Estado</span>
          <Select
            value={status}
            onChange={setStatus}
            allowClear
            placeholder="Todos"
            style={{ width: 150 }}
            options={FILTERABLE_STATUSES.map((s) => ({
              value: s,
              label: RESERVATION_STATUS_LABEL[s],
            }))}
          />
        </label>
        <label>
          <span>Habitación</span>
          <Select
            value={roomId}
            onChange={setRoomId}
            allowClear
            placeholder="Cualquiera"
            style={{ width: 190 }}
            options={rooms.map((room) => ({ value: room.id, label: room.name }))}
          />
        </label>
        <label>
          <span>Fechas</span>
          <RangePicker
            value={range}
            onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
            format="DD/MM/YYYY"
          />
        </label>
        <button className="search-reservation__clear" onClick={clear}>
          Limpiar
        </button>
      </div>

      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={results === null}
        emptyText={
          applied
            ? `Sin resultados para "${applied}".`
            : 'Escribe un término y pulsa Buscar.'
        }
      />

      {results !== null && (
        <p className="search-reservation__count">
          Mostrando {rows.length} {rows.length === 1 ? 'resultado' : 'resultados'}
          {applied && (
            <>
              {' '}para <strong>“{applied}”</strong>
            </>
          )}
        </p>
      )}

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
