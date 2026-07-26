import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Skeleton } from 'antd'
import { ArrowRightOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { getErrorMessage } from '@/shared/api/client'
import {
  formatMoney,
  formatStayRange,
  nightsLabel,
} from '@/features/rooms/lib/stay'
import { RoomPhoto } from '@/shared/components/RoomPhoto/RoomPhoto'
import { localRoomImage } from '@/features/home/data/rooms'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import {
  getUiStatus,
  UI_STATUS_LABEL,
  type ReservationUiStatus,
} from '@/features/client/lib/reservationUi'
import type { Reservation } from '@/features/client/types'
import './MyReservationsPage.scss'

type FilterKey = 'TODAS' | ReservationUiStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'TODAS', label: 'Todas' },
  { key: 'ACTIVA', label: 'Activas' },
  { key: 'CANCELADA', label: 'Canceladas' },
  { key: 'FINALIZADA', label: 'Finalizadas' },
]

const TAG_TONE: Record<ReservationUiStatus, 'success' | 'neutral' | 'danger'> = {
  ACTIVA: 'success',
  FINALIZADA: 'neutral',
  CANCELADA: 'danger',
}

const PAGE_SIZE = 5

/** HU-010 — Listado de reservas propias con filtros por estado. */
export function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('TODAS')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    reservationsApi
      .listMine()
      .then(setReservations)
      .catch((err) =>
        setError(getErrorMessage(err, 'No se pudieron cargar tus reservas.')),
      )
  }, [])

  const filtered = useMemo(() => {
    if (!reservations) return []
    if (filter === 'TODAS') return reservations
    return reservations.filter((r) => getUiStatus(r) === filter)
  }, [reservations, filter])

  const shown = filtered.slice(0, visible)

  return (
    <div className="my-reservations">
      <header className="my-reservations__header">
        <div>
          <h1>Mis Reservas</h1>
          <p>Administra y revisa tus estancias.</p>
        </div>
        <Link to="/panel">
          <Button type="primary" className="btn-cta" icon={<PlusOutlined />}>
            Nueva reserva
          </Button>
        </Link>
      </header>

      <nav className="my-reservations__tabs">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            className={`my-reservations__tab ${
              filter === tab.key ? 'my-reservations__tab--active' : ''
            }`}
            onClick={() => {
              setFilter(tab.key)
              setVisible(PAGE_SIZE)
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <Alert type="error" showIcon message={error} />}

      {!error && reservations === null && (
        <Skeleton active paragraph={{ rows: 8 }} />
      )}

      {reservations !== null && filtered.length === 0 && (
        <Alert
          type="info"
          showIcon
          message={
            filter === 'TODAS'
              ? 'Aún no tienes reservas. ¡Busca disponibilidad y crea la primera!'
              : 'No tienes reservas en este estado.'
          }
        />
      )}

      {shown.map((reservation) => {
        const uiStatus = getUiStatus(reservation)
        const cancelled = uiStatus === 'CANCELADA'
        return (
          <article
            key={reservation.id}
            className={`my-reservations__card ${
              cancelled ? 'my-reservations__card--cancelled' : ''
            }`}
          >
            <div className="my-reservations__photo">
              <RoomPhoto
                src={reservation.room.images[0]}
                fallbackSrc={localRoomImage(reservation.room.slug)}
                alt={reservation.room.name}
              />
            </div>

            <div className="my-reservations__body">
              <div className="my-reservations__top">
                <div>
                  <h2>{reservation.room.name}</h2>
                  <p className="my-reservations__dates">
                    <CalendarOutlined />{' '}
                    {formatStayRange(reservation.check_in, reservation.check_out)}
                    <span className="my-reservations__nights">
                      · {nightsLabel(reservation.nights)}
                    </span>
                  </p>
                </div>
                <StatusTag tone={TAG_TONE[uiStatus]}>
                  {UI_STATUS_LABEL[uiStatus]}
                </StatusTag>
              </div>

              <div className="my-reservations__meta">
                <div>
                  <span className="my-reservations__meta-label">Reserva #</span>
                  <span className="my-reservations__code">{reservation.code}</span>
                </div>
                {!cancelled && (
                  <div>
                    <span className="my-reservations__meta-label">Total</span>
                    <span className="my-reservations__total">
                      {formatMoney(reservation.total)}
                    </span>
                  </div>
                )}
              </div>

              <div className="my-reservations__actions">
                <Link to={`/panel/reservas/${reservation.id}`}>
                  Ver detalle <ArrowRightOutlined />
                </Link>
              </div>
            </div>
          </article>
        )
      })}

      {filtered.length > 0 && (
        <footer className="my-reservations__footer">
          <span>
            Mostrando {shown.length} de {filtered.length}{' '}
            {filtered.length === 1 ? 'reserva' : 'reservas'}
          </span>
          {filtered.length > visible && (
            <button
              className="my-reservations__more"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              Cargar más
            </button>
          )}
        </footer>
      )}
    </div>
  )
}
