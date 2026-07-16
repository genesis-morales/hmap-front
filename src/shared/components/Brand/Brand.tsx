import logo from '@/assets/logo/logo.png'
import './Brand.scss'

interface BrandProps {
  /** Tamaño del isotipo en px. */
  size?: number
  /** Orientación del texto respecto al logo. */
  layout?: 'horizontal' | 'vertical'
  /** Oculta el texto y deja solo el isotipo. */
  iconOnly?: boolean
  className?: string
}

/** Isotipo + wordmark del Hotel Manuel Antonio Park. */
export function Brand({
  size = 40,
  layout = 'horizontal',
  iconOnly = false,
  className = '',
}: BrandProps) {
  return (
    <span className={`brand brand--${layout} ${className}`}>
      <img
        src={logo}
        alt="Hotel Manuel Antonio Park"
        className="brand__logo"
        style={{ width: size, height: size }}
      />
      {!iconOnly && <span className="brand__name">Hotel Manuel Antonio Park</span>}
    </span>
  )
}
