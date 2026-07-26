import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App, Alert, Button, DatePicker, Select, Skeleton } from 'antd'
import {
  CalendarOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { getErrorMessage } from '@/shared/api/client'
import {
  API_DATE_FORMAT,
  formatMoney,
  formatStayRange,
  nightsLabel,
} from '@/features/rooms/lib/stay'
import { RoomPhoto } from '@/shared/components/RoomPhoto/RoomPhoto'
import { localRoomImage } from '@/features/home/data/rooms'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { STATUS_LABEL } from '@/features/client/lib/reservationUi'
import type { Reservation } from '@/features/client/types'
import './EditReservationPage.scss'

type DatesCheck =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available' }
  | { state: 'own-overlap' }
  | { state: 'unavailable' }

/** HU-012 — Edición de fechas/personas de una reserva propia. */
export function EditReservationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [checkIn, setCheckIn] = useState<Dayjs | null>(null)
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null)
  const [guests, setGuests] = useState<number>(2)
  const [check, setCheck] = useState<DatesCheck>({ state: 'idle' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    reservationsApi
      .get(id)
      .then((r) => {
        setReservation(r)
        setCheckIn(dayjs(r.check_in))
        setCheckOut(dayjs(r.check_out))
        setGuests(r.guests)
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'No se pudo cargar la reserva.')),
      )
  }, [id])

  const nights =
    checkIn && checkOut ? checkOut.diff(checkIn, 'day') : reservation?.nights ?? 0

  const datesChanged =
    reservation !== null &&
    checkIn !== null &&
    checkOut !== null &&
    (checkIn.format(API_DATE_FORMAT) !== reservation.check_in ||
      checkOut.format(API_DATE_FORMAT) !== reservation.check_out)

  // Chequeo de disponibilidad del nuevo rango. La API de disponibilidad
  // cuenta la propia reserva como ocupación: si el nuevo rango pisa el
  // actual, el resultado no es concluyente y la validación final la hace
  // el PUT (que sí excluye la propia reserva).
  useEffect(() => {
    if (!reservation || !checkIn || !checkOut || !checkOut.isAfter(checkIn, 'day')) {
      setCheck({ state: 'idle' })
      return
    }
    if (!datesChanged) {
      setCheck({ state: 'idle' })
      return
    }

    let cancelled = false
    setCheck({ state: 'checking' })

    const timer = setTimeout(() => {
      roomsApi
        .availability({
          check_in: checkIn.format(API_DATE_FORMAT),
          check_out: checkOut.format(API_DATE_FORMAT),
          guests,
        })
        .then((rooms) => {
          if (cancelled) return
          if (rooms.some((room) => room.id === reservation.room.id)) {
            setCheck({ state: 'available' })
            return
          }
          const overlapsOwn =
            checkIn.isBefore(dayjs(reservation.check_out)) &&
            checkOut.isAfter(dayjs(reservation.check_in))
          setCheck({ state: overlapsOwn ? 'own-overlap' : 'unavailable' })
        })
        .catch(() => {
          if (!cancelled) setCheck({ state: 'idle' })
        })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [reservation, checkIn, checkOut, guests, datesChanged])

  if (error) {
    return (
      <div className="edit-reservation">
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Link to="/panel/reservas">
              <Button size="small">Volver a mis reservas</Button>
            </Link>
          }
        />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="edit-reservation">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    )
  }

  if (!reservation.can_edit) {
    return (
      <div className="edit-reservation">
        <Alert
          type="warning"
          showIcon
          message="Esta reserva ya no admite cambios."
          description="Solo puedes editar reservas activas hasta 48 horas antes del check-in."
          action={
            <Link to={`/panel/reservas/${reservation.id}`}>
              <Button size="small">Ver detalle</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const { room } = reservation
  const total = room.price_per_night * nights

  const save = async () => {
    if (!checkIn || !checkOut) return
    setSaving(true)
    try {
      const updated = await reservationsApi.update(reservation.id, {
        check_in: checkIn.format(API_DATE_FORMAT),
        check_out: checkOut.format(API_DATE_FORMAT),
        guests,
      })
      message.success('Reserva actualizada con éxito.')
      navigate(`/panel/reservas/${updated.id}`, { replace: true })
    } catch (err) {
      message.error(getErrorMessage(err, 'No se pudo actualizar la reserva.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="edit-reservation">
      <nav className="edit-reservation__breadcrumb">
        <Link to="/panel/reservas">Mis Reservas</Link>
        <span>›</span>
        <Link to={`/panel/reservas/${reservation.id}`}>Detalle de reserva</Link>
        <span>›</span>
        <span>Editar reserva</span>
      </nav>

      <header className="edit-reservation__header">
        <h1>Editar Reserva</h1>
        <span className="edit-reservation__code"># {reservation.code}</span>
      </header>

      <section className="edit-reservation__card">
        <div className="edit-reservation__current">
          <div className="edit-reservation__current-photo">
            <RoomPhoto
              src={room.images[0]}
              fallbackSrc={localRoomImage(room.slug)}
              alt={room.name}
            />
          </div>
          <div className="edit-reservation__current-info">
            <h2>{room.name}</h2>
            <span>
              <CalendarOutlined />{' '}
              {formatStayRange(reservation.check_in, reservation.check_out)}
            </span>
          </div>
          <StatusTag tone="success">{STATUS_LABEL[reservation.status]}</StatusTag>
        </div>

        <div className="edit-reservation__body">
          <h3 className="edit-reservation__section-title">
            <CalendarOutlined /> Seleccionar nuevas fechas
          </h3>

          <div className="edit-reservation__fields">
            <label>
              <span className="edit-reservation__label">Nueva entrada</span>
              <DatePicker
                value={checkIn}
                onChange={(value) => {
                  setCheckIn(value)
                  if (value && checkOut && !checkOut.isAfter(value, 'day')) {
                    setCheckOut(null)
                  }
                }}
                format="DD MMM YYYY"
                disabledDate={(d) => d.isBefore(dayjs(), 'day')}
                allowClear={false}
              />
            </label>
            <label>
              <span className="edit-reservation__label">Nueva salida</span>
              <DatePicker
                value={checkOut}
                onChange={setCheckOut}
                format="DD MMM YYYY"
                disabledDate={(d) =>
                  d.isBefore(dayjs().add(1, 'day'), 'day') ||
                  (checkIn ? !d.isAfter(checkIn, 'day') : false)
                }
                allowClear={false}
              />
            </label>
            <label>
              <span className="edit-reservation__label">Personas</span>
              <Select
                value={guests}
                onChange={setGuests}
                options={Array.from({ length: room.capacity }, (_, i) => ({
                  value: i + 1,
                  label: `${i + 1} ${i === 0 ? 'persona' : 'personas'}`,
                }))}
              />
            </label>
          </div>

          {check.state === 'available' && (
            <span className="edit-reservation__check edit-reservation__check--ok">
              <CheckCircleFilled /> Fechas disponibles
            </span>
          )}
          {check.state === 'own-overlap' && (
            <span className="edit-reservation__check">
              <InfoCircleOutlined /> La disponibilidad final se validará al guardar.
            </span>
          )}
          {check.state === 'unavailable' && (
            <span className="edit-reservation__check edit-reservation__check--bad">
              <InfoCircleOutlined /> La habitación no está libre en esas fechas.
            </span>
          )}

          <div className="edit-reservation__cost">
            <div>
              <span className="edit-reservation__label">Detalle del costo</span>
              <span>
                {formatMoney(room.price_per_night)} / noche × {nightsLabel(nights)}
              </span>
            </div>
            <div className="edit-reservation__cost-total">
              <span className="edit-reservation__label">Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </div>

          <p className="edit-reservation__note">
            <InfoCircleOutlined /> Solo puedes editar reservas hasta{' '}
            <strong>48 horas antes</strong> del check-in. Cambios sujetos a
            disponibilidad y posibles ajustes de tarifa.
          </p>

          <footer className="edit-reservation__actions">
            <Link to={`/panel/reservas/${reservation.id}`}>
              <Button type="text">Cancelar</Button>
            </Link>
            <Button
              type="primary"
              className="btn-cta"
              loading={saving}
              disabled={!checkIn || !checkOut || check.state === 'unavailable'}
              onClick={save}
            >
              Guardar cambios
            </Button>
          </footer>
        </div>
      </section>
    </div>
  )
}
