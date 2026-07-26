import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Drawer } from 'antd'
import { LoginOutlined, MenuOutlined } from '@ant-design/icons'
import { hotel } from '@/shared/config/hotel'
import './Navbar.scss'

// href con "/" al inicio: en la home el navegador solo hace scroll,
// y desde otras páginas públicas (p. ej. /disponibilidad) vuelve a la home.
const NAV_LINKS = [
  { label: 'Inicio', href: '/#inicio', id: 'inicio' },
  { label: 'Habitaciones', href: '/#habitaciones', id: 'habitaciones' },
  { label: 'Comodidades', href: '/#comodidades', id: 'comodidades' },
  { label: 'Testimonios', href: '/#testimonios', id: 'testimonios' },
  { label: 'Galería', href: '/#galeria', id: 'galeria' },
]

/** Barra de navegación flotante del portal público. */
export function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('inicio')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Resalta el enlace de la sección visible (scroll-spy).
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__pill">
        <a href="/#inicio" className="navbar__wordmark" aria-label="Inicio">
          {hotel.name}
        </a>

        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`navbar__link ${
                activeId === link.id ? 'navbar__link--active' : ''
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="navbar__login">
            <Button className="navbar__btn navbar__btn--ghost" icon={<LoginOutlined />}>
              Ingresar
            </Button>
          </Link>
          <Button
            type="primary"
            className="navbar__btn navbar__btn--solid"
            onClick={() => navigate('/panel')}
          >
            Reservar ahora
          </Button>
        </div>

        <button
          className="navbar__burger"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(true)}
        >
          <MenuOutlined />
        </button>
      </div>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="right"
        title={hotel.name}
        width={280}
      >
        <nav className="navbar__drawer-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="navbar__drawer-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <Button block icon={<LoginOutlined />}>
              Ingresar
            </Button>
          </Link>
          <Button
            type="primary"
            block
            className="navbar__btn navbar__btn--solid"
            onClick={() => {
              setMenuOpen(false)
              navigate('/panel')
            }}
          >
            Reservar ahora
          </Button>
        </nav>
      </Drawer>
    </header>
  )
}
