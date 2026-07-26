import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Skeleton } from 'antd'
import {
  EnvironmentOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import { BedIcon } from '@/shared/components/icons/BedIcon'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { getErrorMessage } from '@/shared/api/client'
import { hotel } from '@/shared/config/hotel'
import {
  formatMoney,
  formatStayDate,
  nightsLabel,
} from '@/features/rooms/lib/stay'
import { StatusTag } from '@/features/client/components/StatusTag/StatusTag'
import { CancelReservationModal } from '@/features/client/components/CancelReservationModal/CancelReservationModal'
import {
  getUiStatus,
  STATUS_LABEL,
  UI_STATUS_LABEL,
  type ReservationUiStatus,
} from '@/features/client/lib/reservationUi'
import type { Reservation } from '@/features/client/types'
import './ReservationDetailPage.scss'

const TAG_TONE: Record<ReservationUiStatus, 'success' | 'neutral' | 'danger'> = {
  ACTIVA: 'success',
  FINALIZADA: 'neutral',
  CANCELADA: 'danger',
}

/** HU-011 — Detalle de una reserva propia. */
export function ReservationDetailPage() {
  const { id } = useParams()

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    reservationsApi
      .get(id)
      .then(setReservation)
      .catch((err) =>
        setError(getErrorMessage(err, 'No se pudo cargar la reserva.')),
      )
  }, [id])

  if (error) {
    return (
      <div className="reservation-detail">
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
      <div className="reservation-detail">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    )
  }

  const uiStatus = getUiStatus(reservation)
  const { room } = reservation

  return (
    <div className="reservation-detail">
      <nav className="reservation-detail__breadcrumb">
        <Link to="/panel/reservas">Mis Reservas</Link>
        <span>/</span>
        <span>Detalle de reserva</span>
      </nav>

      <header className="reservation-detail__header">
        <h1>Detalle de Reserva</h1>
        <span className="reservation-detail__code"># {reservation.code}</span>
      </header>

      <section className="reservation-detail__card">
        <div className="reservation-detail__main">
          <h2>{room.name}</h2>

          <div className="reservation-detail__tags">
            <StatusTag tone={TAG_TONE[uiStatus]} dot>
              {UI_STATUS_LABEL[uiStatus]}
            </StatusTag>
            <span className="reservation-detail__chip">
              <TeamOutlined /> Hasta {room.capacity} personas
            </span>
            <span className="reservation-detail__chip">
              <BedIcon /> {room.beds_label}
            </span>
            <span className="reservation-detail__chip">
              <WifiOutlined /> Wifi gratis
            </span>
          </div>

          <dl className="reservation-detail__facts">
            <div>
              <dt>Entrada</dt>
              <dd>{formatStayDate(reservation.check_in)}</dd>
            </div>
            <div>
              <dt>Salida</dt>
              <dd>{formatStayDate(reservation.check_out)}</dd>
            </div>
            <div>
              <dt>Noches</dt>
              <dd>{reservation.nights}</dd>
            </div>
            <div>
              <dt>Personas</dt>
              <dd>{reservation.guests}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd className="reservation-detail__status">
                {STATUS_LABEL[reservation.status]}
              </dd>
            </div>
          </dl>
        </div>

        <aside className="reservation-detail__aside">
          <span className="reservation-detail__price-line">
            {formatMoney(room.price_per_night)} / noche ×{' '}
            {nightsLabel(reservation.nights)}
          </span>
          <span className="reservation-detail__total-label">Total estancia</span>
          <strong className="reservation-detail__total">
            {formatMoney(reservation.total)}
          </strong>

          {reservation.can_edit && (
            <Link to={`/panel/reservas/${reservation.id}/editar`}>
              <Button block className="reservation-detail__edit">
                Editar reserva
              </Button>
            </Link>
          )}

          {reservation.can_cancel && (
            <button
              className="reservation-detail__cancel"
              onClick={() => setCancelOpen(true)}
            >
              Cancelar reserva
            </button>
          )}

          {!reservation.can_edit && uiStatus === 'ACTIVA' && (
            <p className="reservation-detail__window-note">
              Esta reserva ya no admite cambios (menos de 48 h para el check-in).
            </p>
          )}
        </aside>
      </section>

      <div className="reservation-detail__info-grid">
        <section className="reservation-detail__info">
          <h3>
            <InfoCircleOutlined /> Información importante
          </h3>
          <p>
            Al momento del check-in, por favor presente su identificación oficial
            y la tarjeta con la que cancelará su reserva.
          </p>
        </section>

        <section className="reservation-detail__info">
          <h3>
            <EnvironmentOutlined /> Ubicación
          </h3>
          <p>
            {hotel.addressNote} {hotel.address}
          </p>
          <iframe
            title="Ubicación del hotel"
            src={hotel.mapEmbedUrl}
            className="reservation-detail__map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </div>

      <CancelReservationModal
        reservation={reservation}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onCancelled={setReservation}
      />
    </div>
  )
}
