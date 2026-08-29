/**
 * Tests de integración E2E contra la API real.
 * Cubren: catálogo, flujo completo (PENDIENTE → CHECK_OUT), cancelación,
 * y casos negativos / borde.
 *
 * Requisitos:
 * - Backend corriendo en http://localhost:8080 (o API_URL configurado)
 * - Variables de entorno: GUEST_EMAIL, GUEST_PASSWORD
 *
 * Ejecución:
 *   $env:GUEST_EMAIL="cliente@hmap.com"; $env:GUEST_PASSWORD="cliente123"; npm run test:api
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { api, login } from './client'

// Credenciales del seed del backend
const RECEPTION = { email: 'recepcion@hmap.com', password: 'recepcion123' }
const GUEST = {
  email: process.env.GUEST_EMAIL!,
  password: process.env.GUEST_PASSWORD!,
}

/** Genera fecha YYYY-MM-DD sumando días al día de hoy. Evita colisiones entre corridas. */
function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

// ─── Catálogo público ────────────────────────────────────────────────────────

describe('catálogo público', () => {
  it('GET /rooms devuelve habitaciones con imágenes como URLs absolutas de Cloudinary', async () => {
    const { status, data } = await api<any[]>('/rooms')

    expect(status).toBe(200)
    expect(data.length).toBeGreaterThan(0)

    const room = data[0]
    expect(room).toHaveProperty('id')
    expect(room).toHaveProperty('slug')
    expect(room).toHaveProperty('name')
    expect(room).toHaveProperty('capacity')
    expect(room).toHaveProperty('price_per_night')
    expect(room).toHaveProperty('images')

    // Regresión: imágenes deben ser URLs absolutas de Cloudinary
    expect(room.images[0]).toMatch(/^https:\/\/res\.cloudinary\.com\//)
  })
})

// ─── Flujo completo de recepción ─────────────────────────────────────────────

describe('flujo de recepción completo', () => {
  let receptionToken: string
  let guestToken: string

  beforeAll(async () => {
    receptionToken = await login(RECEPTION.email, RECEPTION.password)
  })

  it('login devuelve un token válido para recepción', () => {
    expect(receptionToken).toBeTruthy()
    expect(typeof receptionToken).toBe('string')
  })

  it('GET /panel-reception/occupancy responde con conteo por estado', async () => {
    const { status, data } = await api<{
      occupied: number
      available: number
      maintenance: number
      total: number
    }>('/panel-reception/occupancy', { token: receptionToken })

    expect(status).toBe(200)
    expect(data.total).toBe(data.occupied + data.available + data.maintenance)
    expect(data.total).toBeGreaterThan(0)
  })

  it('flujo completo: PENDIENTE → CONFIRMADA → CHECK_IN → CHECK_OUT', async () => {
    expect(GUEST.email).toBeTruthy()
    expect(GUEST.password).toBeTruthy()

    guestToken = await login(GUEST.email, GUEST.password)

    // Fechas dinámicas para evitar colisiones entre corridas
    const checkIn = futureDate(30)
    const checkOut = futureDate(32)

    // 1. Huésped crea la reserva → PENDIENTE
    const created = await api<{ id: number; status: string; code: string }>(
      '/reservations',
      {
        method: 'POST',
        token: guestToken,
        body: { room_id: 1, check_in: checkIn, check_out: checkOut, guests: 2 },
      },
    )

    expect(created.status).toBe(201)
    expect(created.data.status).toBe('PENDIENTE')
    expect(created.data.code).toMatch(/^RSV-/)

    const id = created.data.id

    // 2. Recepción confirma → CONFIRMADA
    const confirmed = await api<{ status: string }>(
      `/reservations/${id}/confirm`,
      { method: 'POST', token: receptionToken },
    )
    expect(confirmed.status).toBe(200)
    expect(confirmed.data.status).toBe('CONFIRMADA')

    // 3. Recepción hace check-in → CHECK_IN
    const checkedIn = await api<{ status: string }>(
      `/reservations/${id}/check-in`,
      { method: 'POST', token: receptionToken },
    )
    expect(checkedIn.status).toBe(200)
    expect(checkedIn.data.status).toBe('CHECK_IN')

    // 4. Recepción hace check-out → CHECK_OUT
    const checkedOut = await api<{ status: string }>(
      `/reservations/${id}/check-out`,
      { method: 'POST', token: receptionToken },
    )
    expect(checkedOut.status).toBe(200)
    expect(checkedOut.data.status).toBe('CHECK_OUT')
  })

  it('GET /reservations/today devuelve check-ins y check-outs del día', async () => {
    const { status, data } = await api<{
      check_ins: any[]
      check_outs: any[]
    }>('/reservations/today', { token: receptionToken })

    expect(status).toBe(200)
    expect(data).toHaveProperty('check_ins')
    expect(data).toHaveProperty('check_outs')
    expect(Array.isArray(data.check_ins)).toBe(true)
    expect(Array.isArray(data.check_outs)).toBe(true)
  })
})

// ─── Cancelación ─────────────────────────────────────────────────────────────

describe('cancelación de reservas', () => {
  let receptionToken: string
  let guestToken: string

  beforeAll(async () => {
    receptionToken = await login(RECEPTION.email, RECEPTION.password)
    if (GUEST.email && GUEST.password) {
      guestToken = await login(GUEST.email, GUEST.password)
    }
  })

  it('el huésped puede cancelar una reserva PENDIENTE', async () => {
    expect(guestToken).toBeTruthy()

    const checkIn = futureDate(50)
    const checkOut = futureDate(52)

    // Crear reserva
    const created = await api<{ id: number; status: string; can_cancel: boolean }>(
      '/reservations',
      {
        method: 'POST',
        token: guestToken,
        body: { room_id: 1, check_in: checkIn, check_out: checkOut, guests: 2 },
      },
    )
    expect(created.status).toBe(201)
    expect(created.data.status).toBe('PENDIENTE')
    expect(created.data.can_cancel).toBe(true)

    const id = created.data.id

    // Cancelar
    const cancelled = await api<{ status: string }>(
      `/reservations/${id}/cancel`,
      { method: 'POST', token: guestToken },
    )
    expect(cancelled.status).toBe(200)
    expect(cancelled.data.status).toBe('CANCELADA')
  })

  it('no se puede cancelar una reserva en CHECK_IN', async () => {
    expect(guestToken).toBeTruthy()

    const checkIn = futureDate(60)
    const checkOut = futureDate(62)

    // Crear → confirmar → check-in
    const created = await api<{ id: number }>('/reservations', {
      method: 'POST',
      token: guestToken,
      body: { room_id: 1, check_in: checkIn, check_out: checkOut, guests: 2 },
    })
    const id = created.data.id

    await api(`/reservations/${id}/confirm`, {
      method: 'POST',
      token: receptionToken,
    })
    await api(`/reservations/${id}/check-in`, {
      method: 'POST',
      token: receptionToken,
    })

    // Intentar cancelar → debe fallar
    const cancelled = await api(`/reservations/${id}/cancel`, {
      method: 'POST',
      token: guestToken,
    })
    expect(cancelled.status).toBeGreaterThanOrEqual(400)
  })
})

// ─── Tests negativos / casos borde ──────────────────────────────────────────

describe('casos negativos y borde', () => {
  let receptionToken: string
  let guestToken: string

  beforeAll(async () => {
    receptionToken = await login(RECEPTION.email, RECEPTION.password)
    if (GUEST.email && GUEST.password) {
      guestToken = await login(GUEST.email, GUEST.password)
    }
  })

  it('reserva con fechas inválidas (check_out antes de check_in) → 400', async () => {
    expect(guestToken).toBeTruthy()

    const { status } = await api('/reservations', {
      method: 'POST',
      token: guestToken,
      body: {
        room_id: 1,
        check_in: '2026-12-10',
        check_out: '2026-12-08', // antes de check_in
        guests: 2,
      },
    })
    expect(status).toBe(400)
  })

  it('reserva con capacidad excedida → 400', async () => {
    expect(guestToken).toBeTruthy()

    // room_id 1 (cuádruple-estándar) tiene capacidad 6
    const { status } = await api('/reservations', {
      method: 'POST',
      token: guestToken,
      body: {
        room_id: 1,
        check_in: futureDate(70),
        check_out: futureDate(72),
        guests: 99, // excede cualquier capacidad
      },
    })
    expect(status).toBeGreaterThanOrEqual(400)
  })

  it('doble check-in sobre la misma reserva → error', async () => {
    expect(guestToken).toBeTruthy()

    const checkIn = futureDate(80)
    const checkOut = futureDate(82)

    // Crear → confirmar → check-in
    const created = await api<{ id: number }>('/reservations', {
      method: 'POST',
      token: guestToken,
      body: { room_id: 1, check_in: checkIn, check_out: checkOut, guests: 2 },
    })
    const id = created.data.id

    await api(`/reservations/${id}/confirm`, {
      method: 'POST',
      token: receptionToken,
    })
    await api(`/reservations/${id}/check-in`, {
      method: 'POST',
      token: receptionToken,
    })

    // Intentar segundo check-in → debe fallar
    const duplicate = await api(`/reservations/${id}/check-in`, {
      method: 'POST',
      token: receptionToken,
    })
    expect(duplicate.status).toBeGreaterThanOrEqual(400)
  })

  it('token inválido → 401', async () => {
    const { status } = await api('/panel-reception/occupancy', {
      token: 'token-falso-invalido',
    })
    expect(status).toBe(401)
  })

  it('endpoint protegido sin token → 401', async () => {
    const { status } = await api('/panel-reception/occupancy')
    expect(status).toBe(401)
  })

  it('confirmar una reserva inexistente → 404', async () => {
    const { status } = await api('/reservations/999999/confirm', {
      method: 'POST',
      token: receptionToken,
    })
    expect(status).toBe(404)
  })
})
