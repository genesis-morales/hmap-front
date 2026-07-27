import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { receptionApi } from '@/features/reception/api/reception.api'
import { GuestAvatar } from '@/features/reception/components/GuestAvatar/GuestAvatar'
import { PageHeader } from '@/features/reception/components/PageHeader/PageHeader'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { API_DATE_FORMAT } from '@/features/rooms/lib/stay'
import {
  RESERVATION_STATUS_DOT,
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
} from '@/features/reception/lib/reservationStatus'
import type { Reservation, ReservationStatus } from '@/features/client/types'
import './CalendarPage.scss'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const LEGEND: ReservationStatus[] = ['CONFIRMADA', 'PENDIENTE', 'CANCELADA']

/** HU-017 — Calendario mensual de reservas con detalle del día. */
export function CalendarPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'))
  const [selected, setSelected] = useState<Dayjs>(dayjs())
  const [reservations, setReservations] = useState<Reservation[] | null>(null)

  const load = useCallback(() => {
    setReservations(null)
    receptionApi
      .calendar(
        month.startOf('month').format(API_DATE_FORMAT),
        month.endOf('month').format(API_DATE_FORMAT),
      )
      .then(setReservations)
      .catch(() => setReservations([]))
  }, [month])

  useEffect(load, [load])

  // Reservas agrupadas por día de entrada (YYYY-MM-DD).
  const byDay = useMemo(() => {
    const map = new Map<string, Reservation[]>()
    for (const r of reservations ?? []) {
      const key = r.check_in
      map.set(key, [...(map.get(key) ?? []), r])
    }
    return map
  }, [reservations])

  // Celdas del grid: 6 semanas empezando en lunes.
  const cells = useMemo(() => {
    const first = month.startOf('month')
    const mondayOffset = (first.day() + 6) % 7
    const start = first.subtract(mondayOffset, 'day')
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'))
  }, [month])

  const selectedKey = selected.format(API_DATE_FORMAT)
  const dayReservations = byDay.get(selectedKey) ?? []

  return (
    <div className="calendar">
      <PageHeader
        title="Calendario de Reservas"
        breadcrumb={[
          { label: 'Inicio', to: '/panel-reception' },
          { label: 'Calendario' },
        ]}
        subtitle={<span className="calendar__month">{month.format('MMMM YYYY')}</span>}
        actions={
          <div className="calendar__nav">
            <button onClick={() => setMonth((m) => m.subtract(1, 'month'))} aria-label="Mes anterior">
              <LeftOutlined />
            </button>
            <span>{month.format('MMMM YYYY')}</span>
            <button onClick={() => setMonth((m) => m.add(1, 'month'))} aria-label="Mes siguiente">
              <RightOutlined />
            </button>
          </div>
        }
      />

      <div className="calendar__grid-wrap">
        <section className="calendar__card">
          <div className="calendar__weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {reservations === null ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <div className="calendar__grid">
              {cells.map((day) => {
                const inMonth = day.month() === month.month()
                const key = day.format(API_DATE_FORMAT)
                const dots = byDay.get(key) ?? []
                const isSelected = key === selectedKey
                return (
                  <button
                    key={key}
                    className={`calendar__cell ${inMonth ? '' : 'calendar__cell--muted'} ${
                      isSelected ? 'calendar__cell--selected' : ''
                    }`}
                    onClick={() => setSelected(day)}
                  >
                    <span className="calendar__daynum">{day.date()}</span>
                    <span className="calendar__dots">
                      {dots.slice(0, 3).map((r) => (
                        <span
                          key={r.id}
                          className="calendar__dot"
                          style={{ background: RESERVATION_STATUS_DOT[r.status] }}
                        />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <footer className="calendar__legend">
            {LEGEND.map((s) => (
              <span key={s}>
                <span
                  className="calendar__dot"
                  style={{ background: RESERVATION_STATUS_DOT[s] }}
                />
                {RESERVATION_STATUS_LABEL[s]}
              </span>
            ))}
          </footer>
        </section>

        <aside className="calendar__day-card">
          <header>
            <h2>Reservas del día</h2>
            <span className="calendar__day-badge">
              {selected.format('D MMM').toUpperCase()}
            </span>
          </header>

          {dayReservations.length === 0 && (
            <p className="calendar__empty">No hay reservas con entrada este día.</p>
          )}

          <ul className="calendar__day-list">
            {dayReservations.map((r) => (
              <li key={r.id}>
                <GuestAvatar name={r.guest.name} lastName={r.guest.last_name} />
                <div className="calendar__day-info">
                  <strong>
                    {r.guest.name} {r.guest.last_name}
                  </strong>
                  <span>{r.room.name}</span>
                  <StatusTag tone={RESERVATION_STATUS_TONE[r.status]}>
                    {RESERVATION_STATUS_LABEL[r.status]}
                  </StatusTag>
                </div>
              </li>
            ))}
          </ul>

          <Link to="/panel-reception/reservas" className="calendar__all-link">
            Ver todas las reservas
          </Link>
        </aside>
      </div>
    </div>
  )
}
