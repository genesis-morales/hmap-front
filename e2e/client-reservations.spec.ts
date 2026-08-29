import { test, expect } from '@playwright/test'

/**
 * HU-008/HU-010 — Flujo de reservas del cliente.
 * Requiere un cliente registrado. Se loguea en cada test ya que
 * no hay storageState de cliente (se registra dinámicamente).
 */
test.describe('Cliente — motor de reservas', () => {
  const CLIENT = {
    email: `e2e_client_${Date.now()}@hmap.com`,
    password: 'E2eTest123!',
  }

  test.beforeAll(async ({ browser }) => {
    // Registrar el cliente de prueba
    const page = await browser.newPage()
    await page.goto('/registro')
    await page.getByLabel(/nombre/i).first().fill('E2E')
    await page.getByLabel(/apellido/i).fill('Cliente')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel(/contraseña|password/i).fill(CLIENT.password)
    await page.getByRole('button', { name: /registrar|crear cuenta/i }).click()
    await expect(page).not.toHaveURL(/\/registro$/)
    await page.close()
  })

  test('consultar disponibilidad y ver resultados', async ({ page }) => {
    // Login como cliente
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel(/contraseña|password/i).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Ir a disponibilidad del panel del cliente
    await page.goto('/panel/disponibilidad?check_in=2026-09-01&check_out=2026-09-03&guests=2')
    await expect(page.locator('.availability')).toBeVisible()
    await expect(page.getByText(/disponible/i)).toBeVisible()
  })

  test('crear una reserva y verla en mis reservas', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel(/contraseña|password/i).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Ir a confirmar una reserva directamente con parámetros
    await page.goto(
      '/panel/confirmar?room_id=1&check_in=2026-09-10&check_out=2026-09-12&guests=2',
    )
    // El formulario de confirmación debe estar visible
    await expect(page.getByRole('button', { name: /reservar|confirmar/i })).toBeVisible()
    await page.getByRole('button', { name: /reservar|confirmar/i }).click()

    // Debe mostrar confirmación con el código RSV-
    await expect(page.getByText(/RSV-/)).toBeVisible()
  })

  test('ver mis reservas lista la reserva creada', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel(/contraseña|password/i).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    await page.goto('/panel/reservas')
    await expect(page.getByText(/RSV-/)).toBeVisible()
  })

  test('cancelar una reserva pendiente desde mis reservas', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel(/contraseña|password/i).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Crear una reserva nueva para cancelar
    await page.goto(
      '/panel/confirmar?room_id=1&check_in=2026-11-10&check_out=2026-11-12&guests=2',
    )
    await page.getByRole('button', { name: /reservar|confirmar/i }).click()
    await expect(page.getByText(/RSV-/)).toBeVisible()

    // Ir a mis reservas y cancelar
    await page.goto('/panel/reservas')
    await page.getByRole('button', { name: /cancelar/i }).first().click()

    // Confirmar en el modal de cancelación
    await page.getByRole('button', { name: /confirmar|sí|cancelar reserva/i }).click()

    // Verificar que aparece como cancelada
    await expect(page.getByText(/cancelada/i)).toBeVisible()
  })
})
