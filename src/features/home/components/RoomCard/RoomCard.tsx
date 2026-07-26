import { Button } from 'antd'
import { TeamOutlined } from '@ant-design/icons'
import { RoomPhoto } from '@/shared/components/RoomPhoto/RoomPhoto'
import type { Room } from '@/features/home/types'
import './RoomCard.scss'

interface RoomCardProps {
  room: Room
  /** Abre la ventana de detalle de la habitación. */
  onOpen: (room: Room) => void
}

/** HU-002 (resumen) — Tarjeta de habitación en la landing. */
export function RoomCard({ room, onOpen }: RoomCardProps) {
  return (
    <article className="room-card">
      <div className="room-card__media">
        <RoomPhoto
          src={room.images[0]}
          fallbackSrc={room.fallbackImages?.[0]}
          alt={room.name}
        />
      </div>
      <div className="room-card__body">
        <h3 className="room-card__name">{room.name}</h3>
        <span className="room-card__capacity">
          <TeamOutlined /> {room.capacityLabel}
        </span>
        <p className="room-card__tagline">{room.tagline}</p>

        <div className="room-card__footer">
          <span className="room-card__price">
            ${room.pricePerNight}
            <small> /noche</small>
          </span>
          <Button className="room-card__cta" onClick={() => onOpen(room)}>
            Ver más
          </Button>
        </div>
      </div>
    </article>
  )
}
