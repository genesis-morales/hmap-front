import { Image } from 'antd'
import { EnvironmentFilled } from '@ant-design/icons'
import { galleryImages } from '@/features/home/data/images'
import './GallerySection.scss'

/** HU-001 — Galería de fotos del hotel con vista ampliada. */
export function GallerySection() {
  return (
    <section id="galeria" className="gallery section">
      <div className="container">
        <header className="gallery__header">
          <span className="eyebrow">Momentos</span>
          <h2 className="section-heading">Galería</h2>
        </header>

        <Image.PreviewGroup>
          <div className="gallery__grid">
            {galleryImages.map((src, index) => (
              <div className="gallery__item" key={src}>
                <Image src={src} alt={`Galería ${index + 1}`} className="gallery__img" />
                {index === 0 && (
                  <span className="gallery__badge">
                    <EnvironmentFilled />
                    150 mts de la playa y el Parque Nacional Manuel Antonio
                  </span>
                )}
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      </div>
    </section>
  )
}
