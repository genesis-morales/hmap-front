import { Button } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { SearchBar } from '@/features/home/components/SearchBar/SearchBar'
import { openReservation } from '@/shared/lib/openReservation'
import { heroBackground } from '@/features/home/data/images'
import './HeroSection.scss'

/** HU-001 — Hero de bienvenida con consulta de disponibilidad. */
export function HeroSection() {
  return (
    <section id="inicio" className="hero" style={{ backgroundImage: `url(${heroBackground})` }}>
      <div className="hero__overlay" />
      <div className="container hero__content">
        <h1 className="hero__title">Bienvenido al Hotel Manuel Antonio Park</h1>
        <p className="hero__subtitle">Tu paraíso en la costa del Pacífico</p>
        <Button
          type="primary"
          size="large"
          className="btn-cta hero__cta"
          icon={<CalendarOutlined />}
          onClick={openReservation}
        >
          Reservar ahora
        </Button>

        <div className="hero__search">
          <SearchBar />
        </div>
      </div>
    </section>
  )
}
