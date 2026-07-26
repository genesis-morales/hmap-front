import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '@/features/auth/context/AuthContext'
import type { UserRole } from '@/features/auth/types'
import './RequireAuth.scss'

interface RequireAuthProps {
  /** Roles con acceso; sin especificar, basta con estar autenticado. */
  roles?: UserRole[]
  children: ReactNode
}

/**
 * Guarda de ruta por sesión y rol. Conserva la URL completa (path + query)
 * para volver a ella tras el login — así la búsqueda de disponibilidad
 * sobrevive al paso por login (RNF-006).
 */
export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="require-auth__loading">
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
