import { useState } from 'react'
import { RoomCard } from '@/features/home/components/RoomCard/RoomCard'
import { RoomDetailModal } from '@/features/home/components/RoomDetailModal/RoomDetailModal'
import { usePublicRooms } from '@/features/home/hooks/usePublicRooms'
import type { Room } from '@/features/home/types'
import './RoomsSection.scss'

/** HU-001 / HU-002 — Listado de habitaciones con detalle en ventana. */
export function RoomsSection() {
  const rooms = usePublicRooms()
  const [selected, setSelected] = useState<Room | null>(null)

  return (
    <section id="habitaciones" className="rooms section">
      <div className="container">
        <header className="rooms__header">
          <span className="eyebrow">Alojamiento</span>
          <h2 className="section-heading">Nuestras Habitaciones</h2>
          <p className="section-subtitle">
            Espacios diseñados para descansar rodeado de naturaleza, con el confort
            que tu estadía merece.
          </p>
        </header>

        <div className="rooms__grid">
          {rooms.map((room) => (
            <RoomCard key={room.slug} room={room} onOpen={setSelected} />
          ))}
        </div>
      </div>

      <RoomDetailModal
        room={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </section>
  )
}
