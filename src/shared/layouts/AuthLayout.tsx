import { Outlet } from 'react-router-dom'
import { Footer } from '@/shared/components/Footer/Footer'
import './AuthLayout.scss'

/** Layout de autenticación: fondo crema, tarjeta centrada y footer. */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__main">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
