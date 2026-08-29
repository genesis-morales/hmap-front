/**
 * Cliente HTTP tipado para tests de integración contra la API real.
 * Usa fetch nativo (Node 18+). La base URL se configura con la variable
 * de entorno API_URL (por defecto http://localhost:8080).
 */

const BASE_URL = process.env.API_URL ?? 'http://localhost:8080'

interface ApiOptions {
  method?: string
  body?: unknown
  token?: string
}

interface ApiResponse<T> {
  status: number
  data: T
}

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  return { status: res.status, data: text ? JSON.parse(text) : (undefined as T) }
}

export async function login(email: string, password: string): Promise<string> {
  const { status, data } = await api<{ token: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  if (status !== 200) throw new Error(`login falló: ${status}`)
  return data.token
}
