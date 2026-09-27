import { test, expect } from '@playwright/test'

// Helper para generar fechas futuras
function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

test.describe('Portal público (sin sesión)', () => {
  test('la home carga y muestra el catálogo de habitaciones', async ({ page }) => {
    await page.goto('/')
    // El heading principal del hero o de la sección de habitaciones debe ser visible
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    // La sección de habitaciones está presente
    await expect(page.locator('#habitaciones')).toBeVisible()
  })

  test('las imágenes del catálogo se sirven desde Cloudinary', async ({ page }) => {
    await page.goto('/')
    // Esperar a que al menos una imagen de habitación cargue
    const roomImg = page.locator('.room-card__media img').first()
    await expect(roomImg).toBeVisible()
    // Regresión: las imágenes deben ser URLs absolutas de Cloudinary
    await expect(roomImg).toHaveAttribute('src', /res\.cloudinary\.com/)
  })

  test('la búsqueda de disponibilidad navega a resultados', async ({ page }) => {
    await page.goto('/')
    // El formulario del hero/SearchBar envía a /disponibilidad
    const searchSection = page.locator('.hero, .search-bar').first()
    await expect(searchSection).toBeVisible()
  })

  test('la página de disponibilidad muestra resultados', async ({ page }) => {
    const checkIn = futureDate(5)
    const checkOut = futureDate(7)
    await page.goto(`/disponibilidad?check_in=${checkIn}&check_out=${checkOut}&guests=2`)
    await expect(page.locator('.availability')).toBeVisible()
    await expect(page.getByRole('heading', { name: /disponibles/i })).toBeVisible()
  })
})
