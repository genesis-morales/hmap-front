import { test, expect } from '@playwright/test'

test.describe('Panel de Recepción', () => {
  test.use({ storageState: 'e2e/.auth/reception.json' })

  test('el dashboard de ocupación muestra los conteos', async ({ page }) => {
    await page.goto('/panel-reception')
    await expect(page.getByText(/disponible/i)).toBeVisible()
    await expect(page.getByText(/ocupad/i)).toBeVisible()
    await expect(page.getByText(/mantenimiento/i)).toBeVisible()
  })

  test('la página de check-in/out muestra la tabla', async ({ page }) => {
    await page.goto('/panel-reception/check-in-out')
    await expect(page.getByRole('heading', { name: /check.?in/i })).toBeVisible()
  })

  test('el calendario de reservas carga', async ({ page }) => {
    await page.goto('/panel-reception/calendario')
    await expect(page.getByRole('heading', { name: /calendario/i })).toBeVisible()
  })

  test('la lista de reservas muestra la tabla', async ({ page }) => {
    await page.goto('/panel-reception/reservas')
    await expect(page.getByRole('heading', { name: /reservas/i })).toBeVisible()
  })

  test('la gestión de habitaciones muestra la tabla', async ({ page }) => {
    await page.goto('/panel-reception/habitaciones')
    await expect(page.getByRole('heading', { name: /habitaciones/i })).toBeVisible()
  })

  test('crear una reserva manual', async ({ page }) => {
    await page.goto('/panel-reception')
    // Click en "Nueva reserva" desde el dashboard
    await page.getByRole('button', { name: /nueva reserva/i }).click()
    // El modal de reserva manual debe abrirse
    await expect(page.getByText(/reserva manual|nueva reserva/i)).toBeVisible()
  })

  test('la búsqueda de reservas funciona', async ({ page }) => {
    await page.goto('/panel-reception/buscar')
    await expect(page.getByRole('heading', { name: /buscar/i })).toBeVisible()
  })
})
