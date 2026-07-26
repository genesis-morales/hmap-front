import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fromSearchParams } from '@/features/rooms/lib/staySearch'
import { StayDatesBar } from '@/features/client/components/StayDatesBar/StayDatesBar'
import { AvailabilityResults } from '@/features/rooms/components/AvailabilityResults/AvailabilityResults'
import './AvailabilityPage.scss'

/** HU-008 — Consulta de disponibilidad dentro del panel del cliente. */
export function AvailabilityPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const search = useMemo(() => fromSearchParams(params), [params])

  // Sin búsqueda válida en la URL no hay nada que consultar: de vuelta al inicio.
  useEffect(() => {
    if (!search) navigate('/panel', { replace: true })
  }, [search, navigate])

  if (!search) return null

  return (
    <div className="availability-page">
      <StayDatesBar search={search} />
      <AvailabilityResults search={search} changeDatesTo="/panel" />
    </div>
  )
}
