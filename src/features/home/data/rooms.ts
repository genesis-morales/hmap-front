import type { Room } from '@/features/home/types'
import { roomImages } from '@/features/home/data/images'

/** Catálogo de habitaciones (contenido de los prototipos de detalle). */
export const rooms: Room[] = [
  {
    slug: 'cuadruple-estandar',
    name: 'Habitación Cuádruple Estándar',
    badgeLabel: 'Suite Cuádruple',
    capacity: 6,
    capacityLabel: 'Hasta 6 personas',
    area: 10,
    bedsLabel: '2 camas dobles',
    rating: 5,
    tagline: 'Naturaleza sin filtros, confort sin concesiones.',
    pricePerNight: 180,
    images: roomImages('cuadruple-estandar', ['265826807']),
    description:
      'Un espacio amplio pensado para grupos y familias que quieren sentir la selva de cerca sin renunciar a la comodidad. Amanece con el canto de las aves a pocos metros del Parque Nacional Manuel Antonio.',
    bathroom: ['Bañera', 'Ducha', 'WC', 'Toallas', 'Papel higiénico'],
    comodidades: [
      'Aire acondicionado',
      'Ropa de cama',
      'Productos de limpieza',
      'TV de pantalla plana',
      'Nevera',
      'Patio',
      'Planta baja',
    ],
    views: ['Vistas al jardín'],
    smokingPolicy: 'No se puede fumar',
  },
  {
    slug: 'deluxe-cama-grande',
    name: 'Habitación Deluxe con cama extragrande',
    badgeLabel: 'Habitación Deluxe',
    capacity: 2,
    capacityLabel: 'Hasta 2 personas',
    area: 20,
    bedsLabel: '1 cama doble grande',
    rating: 5,
    tagline: 'Donde el descanso y el trópico se encuentran en el mismo lugar.',
    pricePerNight: 240,
    images: roomImages('deluxe-cama-grande', ['265829555', '265829533']),
    description:
      'Una cama extragrande, bañera, vistas al jardín y a la piscina — todo en 20 m² diseñados para que dos personas descansen como se merecen después de explorar Manuel Antonio.',
    bathroom: [
      'Bañera',
      'Artículos de aseo gratis',
      'Ducha',
      'WC',
      'Toallas',
      'Secador de pelo',
      'Papel higiénico',
    ],
    comodidades: [
      'Aire acondicionado',
      'Ropa de cama',
      'Productos de limpieza',
      'TV de pantalla plana',
      'Nevera',
      'Camas extralargas (> 2m)',
      'Planta baja',
      'Accesible en silla de ruedas',
    ],
    views: ['Vistas al jardín', 'Vistas a la piscina'],
    smokingPolicy: 'No se puede fumar',
  },
  {
    slug: 'cuadruple-deluxe',
    name: 'Habitación Cuádruple Deluxe',
    badgeLabel: 'Habitación Deluxe',
    capacity: 4,
    capacityLabel: 'Hasta 4 personas',
    area: 20,
    bedsLabel: '2 camas dobles',
    rating: 5,
    tagline: 'Menos ruido, más presencia — el trópico en su versión más serena.',
    pricePerNight: 150,
    images: roomImages('cuadruple-deluxe'),
    description:
      'Dos camas, balcón con vistas al jardín y a la piscina, y todo el confort que necesitas para llegar del parque y no querer salir. La habitación más completa del hotel, pensada para grupos de hasta cuatro.',
    bathroom: [
      'Bañera',
      'Artículos de aseo gratis',
      'Ducha',
      'WC',
      'Toallas',
      'Secador de pelo',
      'Papel higiénico',
    ],
    comodidades: [
      'Aire acondicionado',
      'Ropa de cama',
      'Productos de limpieza',
      'TV de pantalla plana',
      'Nevera',
      'Camas extralargas (> 2m)',
      'Planta baja',
      'Accesible en silla de ruedas',
    ],
    views: ['Vistas al jardín', 'Vistas a la piscina'],
    smokingPolicy: 'No se puede fumar',
  },
]

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find((room) => room.slug === slug)
}

/** Primera foto local de la habitación; respaldo cuando el CDN falla. */
export function localRoomImage(slug: string): string | undefined {
  return getRoomBySlug(slug)?.images[0]
}
