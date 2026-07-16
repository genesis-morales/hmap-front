import type { ReactNode } from 'react'
import { Button, Image, Modal } from 'antd'
import {
  AppstoreOutlined,
  CheckOutlined,
  EyeOutlined,
  StarFilled,
  StopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { openReservation } from '@/shared/lib/openReservation'
import type { Room } from '@/features/home/types'
import './RoomDetailModal.scss'

interface RoomDetailModalProps {
  room: Room | null
  open: boolean
  onClose: () => void
}

/** Ícono de línea "área" (m²). */
const AreaIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6" />
  </svg>
)

/** Ícono de línea "cama". */
const BedIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M6 10V8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
  </svg>
)

/** Ícono de línea "baño / ducha". */
const BathIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0M8 6h.01" />
  </svg>
)

interface DetailBlockProps {
  icon: ReactNode
  title: string
  children: ReactNode
}

function DetailBlock({ icon, title, children }: DetailBlockProps) {
  return (
    <div className="room-modal__block">
      <h4 className="room-modal__block-title">
        <span className="room-modal__block-icon">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  )
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="room-modal__list">
      {items.map((item) => (
        <li key={item}>
          <CheckOutlined /> {item}
        </li>
      ))}
    </ul>
  )
}

/** HU-002 — Detalle de habitación en ventana modal. */
export function RoomDetailModal({ room, open, onClose }: RoomDetailModalProps) {
  const reservar = () => {
    onClose()
    openReservation()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={940}
      centered
      destroyOnHidden
      className="room-modal"
    >
      {room && (
        <>
          <div className="room-modal__head">
            <div>
              <span className="room-modal__badge">{room.badgeLabel}</span>
              <h2 className="room-modal__title">{room.name}</h2>
              <div className="room-modal__meta">
                <span>{AreaIcon} {room.area} m²</span>
                <span>{BedIcon} {room.bedsLabel}</span>
                <span>
                  <TeamOutlined /> {room.capacityLabel}
                </span>
              </div>
            </div>
            <div className="room-modal__rating" aria-label={`${room.rating} de 5`}>
              {Array.from({ length: room.rating }).map((_, i) => (
                <StarFilled key={i} />
              ))}
            </div>
          </div>

          <p className="room-modal__description">{room.description}</p>

          <div className="room-modal__details">
            <div className="room-modal__col">
              <DetailBlock icon={BathIcon} title="En el baño privado">
                <CheckList items={room.bathroom} />
              </DetailBlock>
              <DetailBlock icon={<EyeOutlined />} title="Vistas">
                <CheckList items={room.views} />
              </DetailBlock>
            </div>
            <div className="room-modal__col">
              <DetailBlock icon={<AppstoreOutlined />} title="Comodidades">
                <CheckList items={room.comodidades} />
              </DetailBlock>
              <DetailBlock icon={<StopOutlined />} title="Política de humo">
                <p className="room-modal__policy">{room.smokingPolicy}</p>
              </DetailBlock>
            </div>
          </div>

          {/* Galería de fotos debajo (preferencia del cliente) */}
          <div className="room-modal__gallery">
            <h4 className="room-modal__gallery-title">Fotos</h4>
            <Image.PreviewGroup>
              <div className="room-modal__thumbs">
                {room.images.map((src, index) => (
                  <div className="room-modal__thumb" key={src}>
                    <Image src={src} alt={`${room.name} — foto ${index + 1}`} />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          </div>

          <div className="room-modal__footer">
            <div className="room-modal__price">
              <span className="room-modal__price-label">Precio por noche</span>
              <strong>
                ${room.pricePerNight}
                <small> USD</small>
              </strong>
            </div>
            <Button type="primary" size="large" className="btn-cta" onClick={reservar}>
              Reservar ahora
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
