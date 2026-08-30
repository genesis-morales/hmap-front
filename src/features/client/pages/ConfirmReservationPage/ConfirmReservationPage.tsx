import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { App, Button, Skeleton } from 'antd'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  IdcardOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { BedIcon } from '@/shared/components/icons/BedIcon'
import { useAuth } from '@/features/auth/context/AuthContext'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { reservationsApi } from '@/features/client/api/reservations.api'
import { getErrorMessage } from '@/shared/api/client'
import {
  formatMoney,
  formatStayRange,
  nightsBetween,
  nightsLabel,
} from '@/features/rooms/lib/stay'
import { fromSearchParams, toSearchParams } from '@/features/rooms/lib/staySearch'
import { StayDatesBar } from '@/features/client/components/StayDatesBar/StayDatesBar'
import {
  ConfirmModal,
  ModalSummary,
  ModalSummaryRow,
  ModalNote,
} from '@/shared/components/Modal'
import { RoomPhoto } from '@/shared/components/RoomPhoto/RoomPhoto'
import { localRoomImage } from '@/features/home/data/rooms'
import type { Room } from '@/features/rooms/types'
import './ConfirmReservationPage.scss'

/** HU-009 — Confirmación y creación de la reserva. */
export function ConfirmReservationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [params] = useSearchParams()

  const search = useMemo(() => fromSearchParams(params), [params])
  const roomId = Number(params.get('room_id'))

  const [room, setRoom] = useState<Room | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const valid = search !== null && Number.isInteger(roomId) && roomId > 0

  useEffect(() => {
    if (!valid) navigate('/panel', { replace: true })
  }, [valid, navigate])

  useEffect(() => {
    if (!valid) return
    roomsApi
      .get(roomId)
      .then(setRoom)
      .catch((err) =>
        setLoadError(getErrorMessage(err, 'No se pudo cargar la habitación.')),
      )
  }, [valid, roomId])

  if (!valid || !search) return null

  const nights = nightsBetween(search.check_in, search.check_out)
  const total = room ? room.price_per_night * nights : 0

  const confirm = async () => {
    const reservation = await reservationsApi.create({
      room_id: roomId,
      check_in: search.check_in,
      check_out: search.check_out,
      guests: search.guests,
    })
    message.success(
      '¡Reserva creada! Te enviamos un correo con la confirmación.',
    )
    navigate(`/panel/reservas/${reservation.id}`, { replace: true })
  }

  return (
    <div className="confirm-reservation">
      <StayDatesBar search={search} />

      <header className="confirm-reservation__header">
        <h1>Confirmar Reserva</h1>
        <p>Estás a un paso de asegurar tu estancia en Manuel Antonio Park.</p>
      </header>

      <div className="confirm-reservation__grid">
        <div className="confirm-reservation__main">
          {loadError && <p className="confirm-reservation__error">{loadError}</p>}

          {!room && !loadError && <Skeleton active paragraph={{ rows: 6 }} />}

          {room && (
            <article className="confirm-reservation__room">
              <div className="confirm-reservation__photo">
                <RoomPhoto
                  src={room.images[0]}
                  fallbackSrc={localRoomImage(room.slug)}
                  alt={room.name}
                />
              </div>
              <div className="confirm-reservation__room-body">
                <h2>{room.name}</h2>
                <div className="confirm-reservation__chips">
                  <span>
                    <TeamOutlined /> Hasta {room.capacity} personas
                  </span>
                  <span>
                    <BedIcon /> {room.beds_label}
                  </span>
                </div>
                <p className="confirm-reservation__dates">
                  <CalendarOutlined />{' '}
                  {formatStayRange(search.check_in, search.check_out)}
                </p>
                <div className="confirm-reservation__room-total">
                  <span>
                    {formatMoney(room.price_per_night)} / noche × {nightsLabel(nights)}
                  </span>
                  <div>
                    <span className="confirm-reservation__total-label">Total</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                </div>
              </div>
            </article>
          )}

          <section className="confirm-reservation__client">
            <header>
              <h3>
                <IdcardOutlined /> Información del Cliente
              </h3>
              <Link to="/panel/perfil">
                Editar perfil <ArrowRightOutlined />
              </Link>
            </header>
            <div className="confirm-reservation__client-grid">
              <div>
                <span className="confirm-reservation__field-label">Cliente</span>
                <span>
                  {user?.name} {user?.last_name}
                </span>
              </div>
              <div>
                <span className="confirm-reservation__field-label">Email</span>
                <span>{user?.email}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="confirm-reservation__aside">
          <section className="confirm-reservation__summary">
            <h3>Resumen Final</h3>
            <dl>
              <div>
                <dt>Habitación × {nightsLabel(nights)}</dt>
                <dd>{room ? formatMoney(total) : '—'}</dd>
              </div>
              <div>
                <dt>Impuestos y tasas</dt>
                <dd>Incluidos</dd>
              </div>
            </dl>
            <div className="confirm-reservation__grand-total">
              <span>Total a pagar</span>
              <strong>{room ? formatMoney(total) : '—'}</strong>
            </div>
            <Button
              type="primary"
              className="btn-cta confirm-reservation__cta"
              onClick={() => setConfirmOpen(true)}
              disabled={!room}
              block
            >
              Confirmar reserva <CheckCircleOutlined />
            </Button>
            <Link
              to={`/panel/disponibilidad?${toSearchParams(search)}`}
              className="confirm-reservation__back"
            >
              <ArrowLeftOutlined /> Volver a habitaciones
            </Link>
          </section>

          <section className="confirm-reservation__help">
            <CustomerServiceOutlined className="confirm-reservation__help-icon" />
            <h4>¿Necesitas ayuda?</h4>
            <p>Nuestro personal está disponible 24/7 para asistirte con tu reserva.</p>
            <a href="mailto:info@manuelantoniopark.com">Contactar soporte</a>
          </section>
        </aside>
      </div>

      {room && (
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          tone="success"
          icon={<CheckCircleOutlined />}
          title="¿Confirmar esta reserva?"
          description="Revisa los datos antes de continuar."
          confirmText="Sí, confirmar reserva"
          cancelText="No, volver"
          stacked
          errorMessage="No se pudo crear la reserva. Intenta de nuevo."
          onConfirm={confirm}
        >
          <ModalSummary heading={room.name}>
            <ModalSummaryRow label="Fechas">
              {formatStayRange(search.check_in, search.check_out)}
            </ModalSummaryRow>
            <ModalSummaryRow label="Noches">
              {nightsLabel(nights)}
            </ModalSummaryRow>
            <ModalSummaryRow label="Personas">{search.guests}</ModalSummaryRow>
            <ModalSummaryRow label="Total a pagar">
              <strong>{formatMoney(total)}</strong>
            </ModalSummaryRow>
          </ModalSummary>

          <ModalNote tone="plain" icon={<CustomerServiceOutlined />}>
            Te enviaremos un correo con la confirmación de la reserva.
          </ModalNote>
        </ConfirmModal>
      )}
    </div>
  )
}
