import { test, expect } from '@playwright/test'

/**
 * HU-008/HU-010 — Flujo de reservas del cliente.
 * Usa el usuario cliente@hmap.com que debe existir en la BD de E2E.
 *
 * Estrategia: usar fechas MUY lejanas (200+ días) para evitar conflictos.
 */
test.describe('Cliente — motor de reservas', () => {
  const CLIENT = {
    email: 'cliente@hmap.com',
    password: 'cliente123',
  }

  // Helper para generar fechas futuras dinámicas (partiendo de 200 días)
  function futureDate(daysFromNow: number): string {
    const d = new Date()
    d.setDate(d.getDate() + 200 + daysFromNow)
    return d.toISOString().slice(0, 10)
  }

  test('consultar disponibilidad y ver resultados', async ({ page }) => {
    // Login como cliente
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel('Contraseña', { exact: true }).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Ir a disponibilidad del panel del cliente con fechas muy futuras
    const checkIn = futureDate(1)
    const checkOut = futureDate(3)
    await page.goto(`/panel/disponibilidad?check_in=${checkIn}&check_out=${checkOut}&guests=2`)
    await expect(page.locator('.availability')).toBeVisible()
    await expect(page.getByText(/disponible/i).first()).toBeVisible()
  })

  test('crear una reserva y verla en mis reservas', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel('Contraseña', { exact: true }).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Ir a confirmar una reserva con fechas muy futuras para evitar conflictos
    const checkIn = futureDate(10)
    const checkOut = futureDate(12)
    await page.goto(
      `/panel/confirmar?room_id=2&check_in=${checkIn}&check_out=${checkOut}&guests=2`,
    )
    // El botón de confirmar debe estar visible
    await expect(page.getByRole('button', { name: /confirmar reserva/i })).toBeVisible()

    // Click en el botón para abrir el modal de confirmación
    await page.getByRole('button', { name: /confirmar reserva/i }).click()

    // Esperar a que el modal esté visible
    await expect(page.getByText('¿Confirmar esta reserva?')).toBeVisible()

    // Buscar el botón de confirmación dentro del modal por texto exacto
    const confirmButton = page.getByRole('button', { name: 'Sí, confirmar reserva' })
    await expect(confirmButton).toBeVisible()
    await confirmButton.click()

    // Debe redirigir a la página de detalle de la reserva
    await page.waitForURL(/\/panel\/reservas\/\d+/, { timeout: 15000 })

    // Verificar que el código RSV- está visible
    await expect(page.getByText(/# ?RSV-/)).toBeVisible()
  })

  test('ver mis reservas lista la reserva creada', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel('Contraseña', { exact: true }).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Crear una reserva primero
    const checkIn = futureDate(20)
    const checkOut = futureDate(22)
    await page.goto(
      `/panel/confirmar?room_id=3&check_in=${checkIn}&check_out=${checkOut}&guests=2`,
    )
    await page.getByRole('button', { name: /confirmar reserva/i }).click()
    await page.getByRole('button', { name: 'Sí, confirmar reserva' }).click()
    await page.waitForURL(/\/panel\/reservas\/\d+/, { timeout: 10000 })

    // Ahora ir a ver mis reservas
    await page.goto('/panel/reservas')
    // Esperar a que aparezca al menos un código de reserva (puede haber múltiples)
    await expect(page.locator('text=/RSV-/').first()).toBeVisible({ timeout: 10000 })
  })

  test('cancelar una reserva pendiente desde mis reservas', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill(CLIENT.email)
    await page.getByLabel('Contraseña', { exact: true }).fill(CLIENT.password)
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).not.toHaveURL(/\/login$/)

    // Crear una reserva nueva para cancelar con fechas muy futuras
    const checkIn = futureDate(40)
    const checkOut = futureDate(42)
    await page.goto(
      `/panel/confirmar?room_id=1&check_in=${checkIn}&check_out=${checkOut}&guests=2`,
    )

    // Esperar a que el botón esté habilitado
    const confirmBtn = page.getByRole('button', { name: /confirmar reserva/i })
    await expect(confirmBtn).toBeEnabled({ timeout: 10000 })
    await confirmBtn.click()

    await page.getByRole('button', { name: 'Sí, confirmar reserva' }).click()
    await page.waitForURL(/\/panel\/reservas\/\d+/, { timeout: 10000 })

    // Ir a mis reservas y cancelar
    await page.goto('/panel/reservas')

    // Esperar a que cargue la tabla y hacer clic en cancelar
    await page.getByRole('button', { name: /cancelar/i }).first().click()

    // Confirmar en el modal de cancelación
    await page.getByRole('button', { name: /sí|confirmar/i }).click()

    // Verificar que aparece como cancelada
    await expect(page.getByText(/cancelada/i)).toBeVisible({ timeout: 10000 })
  })
})
