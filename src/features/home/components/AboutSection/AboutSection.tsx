import { ArrowRightOutlined } from '@ant-design/icons'
import { aboutImage } from '@/features/home/data/images'
import './AboutSection.scss'

/** HU-001 — Descripción general del hotel. */
export function AboutSection() {
  return (
    <section id="nuestro-hotel" className="about section">
      <div className="container about__grid">
        <div className="about__text">
          <span className="eyebrow">Nuestro Hotel</span>
          <h2 className="section-heading">
            Un refugio entre la selva y el mar en Manuel Antonio
          </h2>
          <p className="about__body">
            A pocos metros del Parque Nacional Manuel Antonio, nuestro hotel combina
            el confort de un alojamiento boutique con la fuerza de la naturaleza
            costarricense. Habitaciones amplias, piscina al aire libre y el sonido
            constante de la selva tropical para una estadía inolvidable.
          </p>
          <p className="about__body">
            Cada rincón está pensado para que te reconectes con la vida silvestre sin
            renunciar a la comodidad que mereces.
          </p>
          <a href="#habitaciones" className="about__link">
            Lea sobre nuestra misión <ArrowRightOutlined />
          </a>
        </div>

        <div className="about__media">
          <div className="about__glow" />
          <img src={aboutImage} alt="Instalaciones del Hotel Manuel Antonio Park" />
        </div>
      </div>
    </section>
  )
}
