import { useMemo } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { fromSearchParams, toSearchParams } from '@/features/rooms/lib/staySearch'
import { StayDatesBar } from '@/features/client/components/StayDatesBar/StayDatesBar'
import { AvailabilityResults } from '@/features/rooms/components/AvailabilityResults/AvailabilityResults'
import './PublicAvailabilityPage.scss'

/**
 * RF-005/RF-006 — Disponibilidad para el visitante, sin iniciar sesión:
 * ve habitaciones, precios y total antes de decidir. Al dar "Reservar",
 * RequireAuth pide login/registro y lo deja en la confirmación de reserva.
 */
export function PublicAvailabilityPage() {
  const [params] = useSearchParams()
  const { user } = useAuth()

  const search = useMemo(() => fromSearchParams(params), [params])

  // Sin búsqueda válida no hay nada que mostrar: al inicio del portal.
  if (!search) return <Navigate to="/" replace />

  // Un cliente con sesión hace la misma consulta dentro de su panel.
  if (user?.role === 'CLIENTE') {
    return <Navigate to={`/panel/disponibilidad?${toSearchParams(search)}`} replace />
  }

  return (
    <div className="public-availability">
      <StayDatesBar search={search} changeTo="/" />
      <AvailabilityResults search={search} changeDatesTo="/" />
    </div>
  )
}
