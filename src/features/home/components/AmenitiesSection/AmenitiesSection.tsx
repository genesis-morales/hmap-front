import { amenities } from '@/features/home/data/amenities'
import { amenityIcons } from '@/features/home/components/AmenitiesSection/amenityIcons'
import './AmenitiesSection.scss'

/** HU-001 — Comodidades destacadas del hotel. */
export function AmenitiesSection() {
  return (
    <section id="comodidades" className="amenities section">
      <div className="container">
        <header className="amenities__header">
          <span className="eyebrow">Servicios</span>
          <h2 className="section-heading">Nuestras Comodidades</h2>
        </header>

        <ul className="amenities__grid">
          {amenities.map((amenity) => (
            <li key={amenity.key} className="amenities__item">
              <span className="amenities__icon">{amenityIcons[amenity.key]}</span>
              <span className="amenities__label">{amenity.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
