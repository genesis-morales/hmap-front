import { CheckOutlined } from '@ant-design/icons'
import './PasswordStrength.scss'

interface PasswordStrengthProps {
  password: string
}

const RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una letra mayúscula', test: (p: string) => /[A-ZÁÉÍÓÚÑ]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /\d/.test(p) },
]

const LEVELS = ['Seguridad baja', 'Seguridad baja', 'Seguridad media', 'Seguridad alta']

/** Medidor de fuerza + checklist de requisitos (prototipo Cambiar Contraseña). */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const passed = RULES.filter((rule) => rule.test(password)).length

  return (
    <div className="password-strength">
      <div className="password-strength__bars">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`password-strength__bar ${
              passed >= level ? `password-strength__bar--on-${passed}` : ''
            }`}
          />
        ))}
      </div>
      {password && (
        <span className={`password-strength__label password-strength__label--${passed}`}>
          {LEVELS[passed]}
        </span>
      )}
      <ul className="password-strength__rules">
        {RULES.map((rule) => (
          <li
            key={rule.label}
            className={rule.test(password) ? 'password-strength__rule--ok' : ''}
          >
            <CheckOutlined /> {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
