import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, DatePicker, Select, Skeleton } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useAuth } from '@/features/auth/context/AuthContext'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { API_DATE_FORMAT, formatStayRange } from '@/features/rooms/lib/stay'
import { toSearchParams } from '@/features/rooms/lib/staySearch'
import { RoomPhoto } from '@/shared/components/RoomPhoto/RoomPhoto'
import { localRoomImage } from '@/features/home/data/rooms'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import {
  getUiStatus,
  UI_STATUS_LABEL,
  type ReservationUiStatus,
} from '@/features/client/lib/reservationUi'
import type { Reservation } from '@/features/client/types'
import './PanelHomePage.scss'

const TAG_TONE: Record<ReservationUiStatus, 'success' | 'neutral' | 'danger'> = {
  ACTIVA: 'success',
  FINALIZADA: 'neutral',
  CANCELADA: 'danger',
}

/** HU-007 — Inicio del portal del cliente. */
export function PanelHomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [checkIn, setCheckIn] = useState<Dayjs | null>(null)
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null)
  const [guests, setGuests] = useState(2)

  const [recent, setRecent] = useState<Reservation[] | null>(null)

  useEffect(() => {
    reservationsApi
      .listMine()
      .then((all) => setRecent(all.slice(0, 2)))
      .catch(() => setRecent([]))
  }, [])

  const search = () => {
    if (!checkIn || !checkOut) {
      message.warning('Selecciona las fechas de entrada y salida.')
      return
    }
    navigate(
      `/panel/disponibilidad?${toSearchParams({
        check_in: checkIn.format(API_DATE_FORMAT),
        check_out: checkOut.format(API_DATE_FORMAT),
        guests,
      })}`,
    )
  }

  return (
    <div className="panel-home">
      <header className="panel-home__header">
        <h1 className="panel-home__title">Bienvenido, {user?.name}</h1>
        <p className="panel-home__subtitle">
          Que disfrutes tu estadía en Manuel Antonio
        </p>
      </header>

      <div className="panel-home__grid">
        <section className="panel-home__search-card">
          <h2 className="panel-home__search-title">¿Listo para reservar?</h2>

          <div className="panel-home__fields">
            <label className="panel-home__field">
              <span className="panel-home__label">Fecha de entrada</span>
              <DatePicker
                value={checkIn}
                onChange={(value) => {
                  setCheckIn(value)
                  // Mantiene la salida coherente con la nueva entrada.
                  if (value && checkOut && !checkOut.isAfter(value, 'day')) {
                    setCheckOut(null)
                  }
                }}
                format="DD MMM YYYY"
                placeholder="Llegada"
                disabledDate={(d) => d.isBefore(dayjs(), 'day')}
              />
            </label>

            <label className="panel-home__field">
              <span className="panel-home__label">Fecha de salida</span>
              <DatePicker
                value={checkOut}
                onChange={setCheckOut}
                format="DD MMM YYYY"
                placeholder="Salida"
                disabledDate={(d) =>
                  d.isBefore(dayjs().add(1, 'day'), 'day') ||
                  (checkIn ? !d.isAfter(checkIn, 'day') : false)
                }
              />
            </label>

            <label className="panel-home__field panel-home__field--guests">
              <span className="panel-home__label">Personas</span>
              <Select
                value={guests}
                onChange={setGuests}
                options={[1, 2, 3, 4, 5, 6].map((n) => ({
                  value: n,
                  label: `${n} ${n === 1 ? 'persona' : 'personas'}`,
                }))}
              />
            </label>
          </div>

          <Button type="primary" className="btn-cta panel-home__cta" onClick={search}>
            Ver disponibilidad <ArrowRightOutlined />
          </Button>
        </section>

        <aside className="panel-home__recent">
          <div className="panel-home__recent-header">
            <h2>Mis Reservas</h2>
            <Link to="/panel/reservas" className="panel-home__recent-link">
              Ver todas <ArrowRightOutlined />
            </Link>
          </div>

          {recent === null && <Skeleton active paragraph={{ rows: 4 }} />}

          {recent !== null && recent.length === 0 && (
            <p className="panel-home__empty">
              Aún no tienes reservas. ¡Busca disponibilidad y crea la primera!
            </p>
          )}

          {recent?.map((reservation) => {
            const uiStatus = getUiStatus(reservation)
            return (
              <Link
                key={reservation.id}
                to={`/panel/reservas/${reservation.id}`}
                className="panel-home__reservation"
              >
                <div className="panel-home__reservation-photo">
                  <RoomPhoto
                    src={reservation.room.images[0]}
                    fallbackSrc={localRoomImage(reservation.room.slug)}
                    alt={reservation.room.name}
                  />
                </div>
                <div className="panel-home__reservation-body">
                  <StatusTag tone={TAG_TONE[uiStatus]}>
                    {UI_STATUS_LABEL[uiStatus]}
                  </StatusTag>
                  <h3>{reservation.room.name}</h3>
                  <span className="panel-home__reservation-dates">
                    {formatStayRange(reservation.check_in, reservation.check_out)}
                  </span>
                </div>
              </Link>
            )
          })}
        </aside>
      </div>
    </div>
  )
}
