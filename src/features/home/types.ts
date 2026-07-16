export interface Room {
  /** Identificador de la habitación en la URL / navegación. */
  slug: string
  name: string
  /** Etiqueta de categoría (badge): "Suite Cuádruple", "Habitación Deluxe"... */
  badgeLabel: string
  capacity: number
  capacityLabel: string
  /** Superficie en m². */
  area: number
  /** Descripción de camas: "2 camas dobles", "1 cama doble grande"... */
  bedsLabel: string
  rating: number
  tagline: string
  pricePerNight: number
  images: string[]
  /** Descripción extendida para la vista de detalle. */
  description: string
  bathroom: string[]
  comodidades: string[]
  views: string[]
  smokingPolicy: string
}

export interface Testimonial {
  quote: string
  author: string
  location: string
  rating: number
}

export interface Amenity {
  key: string
  label: string
}
