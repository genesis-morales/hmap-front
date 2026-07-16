import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/features/auth/api/auth.api'
import { TOKEN_STORAGE_KEY } from '@/shared/config/env'
import type { LoginRequest, RegisterRequest, User } from '@/features/auth/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Al montar, si hay token intenta recuperar el usuario.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const { token, user } = await authApi.login(payload)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUser(user)
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    const { token, user } = await authApi.register(payload)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
