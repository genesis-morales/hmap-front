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
  login: (payload: LoginRequest) => Promise<User>
  register: (payload: RegisterRequest) => Promise<User>
  logout: () => void
  /** Sincroniza el usuario en memoria tras editar el perfil (HU-014). */
  updateUser: (user: User) => void
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
      .then((u) => {
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  // El backend devuelve { token } (sin user): guarda el token primero
  // y completa la sesión con GET /auth/me si el user no vino en la respuesta.
  const startSession = useCallback(async (token: string, user?: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    const resolved = user ?? (await authApi.me())
    setUser(resolved)
    return resolved
  }, [])

  const login = useCallback(
    async (payload: LoginRequest) => {
      const { token, user } = await authApi.login(payload)
      return startSession(token, user)
    },
    [startSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const { token, user } = await authApi.register(payload)
      return startSession(token, user)
    },
    [startSession],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback((updated: User) => {
    setUser(updated)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
