import { useEffect, useState } from 'react'
import { roomsApi } from '@/features/rooms/api/rooms.api'
import { getRoomBySlug, rooms as localRooms } from '@/features/home/data/rooms'
import type { Room } from '@/features/home/types'
import type { Room as ApiRoom } from '@/features/rooms/types'

/**
 * En E2 el catálogo vive en la BD (GET /rooms) y rooms.ts pasa a ser
 * respaldo: aporta los extras de presentación que la API no modela
 * (badge, rating, tagline), las fotos locales cuando el CDN aún no
 * está configurado, y todo el contenido si la API no responde.
 */
function toViewRoom(api: ApiRoom): Room {
  const local = getRoomBySlug(api.slug)
  const cdnImages = api.images.filter((url) => /^https?:\/\//.test(url))
  // Priorizar imágenes locales (ya tienen el orden correcto con la portada
  // definida por `priority` en rooms.ts); CDN como respaldo.
  const chosen = local?.images && local.images.length > 0
    ? local.images
    : cdnImages

  return {
    slug: api.slug,
    name: api.name,
    badgeLabel: local?.badgeLabel ?? 'Habitación',
    capacity: api.capacity,
    capacityLabel: `Hasta ${api.capacity} personas`,
    area: api.area,
    bedsLabel: api.beds_label,
    rating: local?.rating ?? 5,
    tagline: local?.tagline ?? api.description,
    pricePerNight: api.price_per_night,
    images: chosen,
    fallbackImages: local?.images ?? [],
    description: api.description,
    bathroom: api.bathroom,
    comodidades: api.amenities,
    views: api.views,
    smokingPolicy: api.smoking_policy,
  }
}

/** Catálogo del portal público servido por la API, con respaldo local. */
export function usePublicRooms(): Room[] {
  const [rooms, setRooms] = useState<Room[]>(localRooms)

  useEffect(() => {
    let cancelled = false
    roomsApi
      .list()
      .then((apiRooms) => {
        if (!cancelled && apiRooms.length > 0) {
          setRooms(apiRooms.map(toViewRoom))
        }
      })
      .catch(() => {
        // Sin API disponible el portal sigue mostrando el catálogo local.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return rooms
}
