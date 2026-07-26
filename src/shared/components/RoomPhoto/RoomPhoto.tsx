import { useState } from 'react'
import { PictureOutlined } from '@ant-design/icons'
import './RoomPhoto.scss'

interface RoomPhotoProps {
  src?: string
  /** Imagen local de respaldo si la del CDN falla (p. ej. Cloudinary mal configurado). */
  fallbackSrc?: string
  alt: string
  className?: string
}

/**
 * Foto de habitación con reserva visual en cascada: intenta la URL del CDN,
 * si falla usa la foto local del catálogo y, en último caso, muestra un
 * marcador neutro en lugar de una imagen rota.
 */
export function RoomPhoto({ src, fallbackSrc, alt, className = '' }: RoomPhotoProps) {
  const [failed, setFailed] = useState<string[]>([])

  const current = [src, fallbackSrc].find(
    (candidate): candidate is string => Boolean(candidate) && !failed.includes(candidate!),
  )

  if (!current) {
    return (
      <div className={`room-photo room-photo--empty ${className}`} role="img" aria-label={alt}>
        <PictureOutlined />
      </div>
    )
  }

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      className={`room-photo ${className}`}
      onError={() => setFailed((prev) => [...prev, current])}
    />
  )
}
