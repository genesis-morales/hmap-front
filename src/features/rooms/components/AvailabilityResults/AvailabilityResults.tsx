import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Skeleton } from 'antd'
import { ExpandOutlined, TeamOutlined } from '@ant-design/icons'
import { BedIcon } from '@/shared/components/icons/BedIcon'
import { RoomPhoto } from '@/shared/components/RoomPhoto/RoomPhoto'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { getErrorMessage } from '@/shared/api/client'
import { formatMoney, nightsBetween, nightsLabel } from '@/features/rooms/lib/stay'
import { toSearchParams } from '@/features/rooms/lib/staySearch'
import { localRoomImage } from '@/features/home/data/rooms'
import type { Room, StaySearch } from '@/features/rooms/types'
import './AvailabilityResults.scss'

/** Motivo por el que una habitación no aparece como disponible. */
type UnavailableReason = 'MAINTENANCE' | 'CAPACITY' | 'BOOKED'

interface UnavailableRoom {
  room: Room
  reason: UnavailableReason
}

interface Results {
  available: Room[]
  unavailable: UnavailableRoom[]
}

/** Etiqueta corta (badge) por motivo. */
const UNAVAILABLE_BADGE: Record<UnavailableReason, string> = {
  MAINTENANCE: 'En mantenimiento',
  CAPACITY: 'Capacidad insuficiente',
  BOOKED: 'No disponible',
}

interface AvailabilityResultsProps {
  search: StaySearch
  /** A dónde vuelve el visitante para cambiar la búsqueda ('/panel' o '/'). */
  changeDatesTo: string
}

/**
 * HU-008 / RF-006 — Resultados de disponibilidad por fechas y personas.
 * Compartido entre el portal público (visitante) y el panel del cliente:
 * "Reservar" siempre apunta a /panel/confirmar; si no hay sesión,
 * RequireAuth pasa por login/registro y retoma la reserva (RNF-006).
 */
export function AvailabilityResults({ search, changeDatesTo }: AvailabilityResultsProps) {
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setResults(null)
    setError(null)

    Promise.all([roomsApi.availability(search), roomsApi.list()])
      .then(([available, all]) => {
        const availableIds = new Set(available.map((room) => room.id))
        // Clasifica por qué cada habitación no está disponible: primero
        // mantenimiento, luego capacidad insuficiente y, si no, fechas ocupadas.
        const unavailable: UnavailableRoom[] = all
          .filter((room) => !availableIds.has(room.id))
          .map((room) => ({
            room,
            reason:
              room.status === 'MANTENIMIENTO'
                ? 'MAINTENANCE'
                : room.capacity < search.guests
                  ? 'CAPACITY'
                  : 'BOOKED',
          }))
        setResults({ available, unavailable })
      })
      .catch((err) =>
        setError(getErrorMessage(err, 'No se pudo consultar la disponibilidad.')),
      )
  }, [search])

  const nights = nightsBetween(search.check_in, search.check_out)
  const query = toSearchParams(search)

  return (
    <div className="availability">
      <header className="availability__header">
        <h1>Habitaciones Disponibles</h1>
        {results && (
          <span className="availability__count">
            {results.available.length}{' '}
            {results.available.length === 1
              ? 'opción encontrada'
              : 'opciones encontradas'}
          </span>
        )}
      </header>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Link to={changeDatesTo}>
              <Button size="small">Cambiar fechas</Button>
            </Link>
          }
        />
      )}

      {!error && results === null && <Skeleton active paragraph={{ rows: 8 }} />}

      {results && results.available.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="No hay habitaciones libres para esas fechas."
          description="Prueba con otro rango de fechas o menos personas."
        />
      )}

      {results?.available.map((room, index) => (
        <article key={room.id} className="availability__card">
          <div className="availability__photo">
            {index === 0 && (
              <span className="availability__badge">Recomendado</span>
            )}
            <RoomPhoto
              src={room.images[0]}
              fallbackSrc={localRoomImage(room.slug)}
              alt={room.name}
            />
          </div>

          <div className="availability__body">
            <h2>{room.name}</h2>
            <div className="availability__chips">
              <span>
                <TeamOutlined /> Hasta {room.capacity} personas
              </span>
              <span>
                <BedIcon /> {room.beds_label}
              </span>
              <span>
                <ExpandOutlined /> {room.area} m²
              </span>
            </div>
            <p className="availability__description">{room.description}</p>

            <div className="availability__footer">
              <div className="availability__pricing">
                <span className="availability__price-label">Precio por noche</span>
                <span className="availability__price">
                  {formatMoney(room.price_per_night)} <small>/ noche</small>
                </span>
                <span className="availability__total">
                  Total: {formatMoney(room.price_per_night * nights)} por{' '}
                  {nightsLabel(nights)}
                </span>
              </div>
              <Link to={`/panel/confirmar?room_id=${room.id}&${query}`}>
                <Button type="primary" className="btn-cta">
                  Reservar
                </Button>
              </Link>
            </div>
          </div>
        </article>
      ))}

      {results?.unavailable.map(({ room, reason }) => (
        <article
          key={room.id}
          className="availability__card availability__card--disabled"
        >
          <div className="availability__photo">
            <span className="availability__badge availability__badge--off">
              {UNAVAILABLE_BADGE[reason]}
            </span>
            <RoomPhoto
              src={room.images[0]}
              fallbackSrc={localRoomImage(room.slug)}
              alt={room.name}
            />
          </div>

          <div className="availability__body">
            <h2>{room.name}</h2>
            <div className="availability__chips">
              <span>
                <TeamOutlined /> Hasta {room.capacity} personas
              </span>
              <span>
                <BedIcon /> {room.beds_label}
              </span>
            </div>
            <p className="availability__description">{room.description}</p>

            <div className="availability__footer">
              <span className="availability__off-note">
                {reason === 'MAINTENANCE'
                  ? 'Esta habitación está temporalmente en mantenimiento.'
                  : reason === 'CAPACITY'
                    ? `Capacidad máxima ${room.capacity} personas; no admite ${search.guests}.`
                    : 'Fechas ocupadas para este tipo de habitación.'}
              </span>
              <Button disabled>Reservar</Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
