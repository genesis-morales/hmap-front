import { Link } from 'react-router-dom'
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons'
import { formatStayDate, nightsBetween, nightsLabel } from '@/features/rooms/lib/stay'
import type { StaySearch } from '@/features/rooms/types'
import './StayDatesBar.scss'

interface StayDatesBarProps {
  search: StaySearch
  /** A dónde vuelve "Cambiar fechas" (por defecto, el inicio del panel). */
  changeTo?: string
}

/** Barra superior con la estancia seleccionada (prototipos de disponibilidad/confirmación). */
export function StayDatesBar({ search, changeTo = '/panel' }: StayDatesBarProps) {
  const nights = nightsBetween(search.check_in, search.check_out)

  return (
    <div className="stay-dates-bar">
      <span className="stay-dates-bar__icon">
        <CalendarOutlined />
      </span>
      <span className="stay-dates-bar__dates">
        <strong>Entrada:</strong> {formatStayDate(search.check_in)}
        <span className="stay-dates-bar__arrow">→</span>
        <strong>Salida:</strong> {formatStayDate(search.check_out)}
      </span>
      <span className="stay-dates-bar__divider" />
      <span className="stay-dates-bar__nights">{nightsLabel(nights)}</span>
      <Link to={changeTo} className="stay-dates-bar__change">
        <ArrowLeftOutlined /> Cambiar fechas
      </Link>
    </div>
  )
}
