// Carga de imágenes del hotel desde src/assets vía import.meta.glob.
// Los nombres de archivo se ordenan alfabéticamente para consistencia.

import heroMain from '@/assets/hero/manuel-antonio-a.webp'
import heroAbout from '@/assets/hero/236254814_1_.webp'

/** Foto panorámica de fondo del hero. */
export const heroBackground = heroMain
/** Foto del hotel usada en la sección "Nuestro Hotel". */
export const aboutImage = heroAbout

const roomModules = import.meta.glob('../../../assets/rooms/**/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const galleryModules = import.meta.glob('../../../assets/gallery/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/**
 * Devuelve las imágenes de una subcarpeta de /rooms.
 * Orden alfabético por defecto; `priority` flota al inicio (en su orden)
 * los archivos cuyo nombre contenga alguno de esos fragmentos —útil para
 * fijar la foto de portada (p. ej. la cama) sin renombrar archivos.
 */
export function roomImages(folder: string, priority: string[] = []): string[] {
  const entries = Object.entries(roomModules)
    .filter(([path]) => path.includes(`/rooms/${folder}/`))
    .sort(([a], [b]) => a.localeCompare(b))

  const rank = (path: string) => {
    const i = priority.findIndex((frag) => path.includes(frag))
    return i === -1 ? priority.length : i
  }

  return entries.sort(([a], [b]) => rank(a) - rank(b)).map(([, url]) => url)
}

/** Todas las imágenes de la galería, ordenadas. */
export const galleryImages: string[] = Object.entries(galleryModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)
