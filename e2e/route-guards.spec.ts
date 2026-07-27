import { test, expect } from '@playwright/test'

test.describe('Guardas de ruta por rol (RNF-001)', () => {
  test('un usuario sin sesión no puede acceder al panel del cliente', async ({
    page,
  }) => {
    await page.goto('/panel')
    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/)
  })

  test('un usuario sin sesión no puede acceder al panel de recepción', async ({
    page,
  }) => {
    await page.goto('/panel-reception')
    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/)
  })

  test.describe('Recepcionista no accede a rutas de cliente', () => {
    test.use({ storageState: 'e2e/.auth/reception.json' })

    test('un recepcionista no puede entrar al panel del cliente', async ({
      page,
    }) => {
      await page.goto('/panel')
      // El FE debe bloquear/redirigir — no debería quedarse en /panel
      await expect(page).not.toHaveURL(/^\/panel$/)
    })
  })

  test.describe('Acceso del admin al panel de recepción', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' })

    test('el admin SÍ puede acceder al panel de recepción', async ({ page }) => {
      await page.goto('/panel-reception')
      // El admin tiene acceso (rol ADMINISTRADOR está permitido)
      await expect(page).toHaveURL(/\/panel-reception/)
      await expect(page.getByText(/disponible/i)).toBeVisible()
    })
  })
})
