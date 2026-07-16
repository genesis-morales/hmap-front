import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

/**
 * Al cambiar de ruta: sube al inicio, o desplaza suavemente
 * a la sección indicada por el hash (#habitaciones, #galeria, ...).
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return <Outlet />
}
