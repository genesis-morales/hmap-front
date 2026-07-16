import {
  MailOutlined,
  PhoneOutlined,
  FacebookFilled,
  CompassOutlined,
} from '@ant-design/icons'
import { hotel } from '@/shared/config/hotel'
import logo from '@/assets/logo/logo.png'
import './Footer.scss'

/** Pie de página del sitio (compartido por portal público y auth). */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        {/* Marca */}
        <div className="site-footer__brand">
          <span className="site-footer__wordmark">
            <img src={logo} alt="" className="site-footer__logo" />
            <span>{hotel.name}</span>
          </span>
          <p className="site-footer__copy">© 2026 {hotel.name}</p>
          <div className="site-footer__social">
            <a href={hotel.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer">
              <FacebookFilled />
            </a>
            <a href={hotel.social.tripadvisor} aria-label="Tripadvisor" target="_blank" rel="noreferrer">
              <CompassOutlined />
            </a>
          </div>
        </div>

        {/* Contacto */}
        <div className="site-footer__col">
          <h4 className="site-footer__heading">Información de Contacto</h4>
          <a className="site-footer__item" href={`tel:${hotel.phone.replace(/\s/g, '')}`}>
            <PhoneOutlined />
            <span>{hotel.phone}</span>
          </a>
          <a className="site-footer__item" href={`mailto:${hotel.email}`}>
            <MailOutlined />
            <span>{hotel.email}</span>
          </a>
        </div>

        {/* Ubicación */}
        <div className="site-footer__col">
          <h4 className="site-footer__heading">Ubicación</h4>
          <p className="site-footer__address">
            {hotel.address}
            <br />
            {hotel.addressNote}
          </p>
          <div className="site-footer__map">
            <iframe
              title="Ubicación del hotel"
              src={hotel.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
