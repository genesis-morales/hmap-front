import { test, expect } from '@playwright/test'

/**
 * E4 — Panel de Administración (gestión de usuarios).
 * Nota: El panel admin aún no existe en el router (se creará en E4).
 * Estos tests están preparados para cuando se implemente.
 * Por ahora verifican que el admin puede acceder al panel de recepción.
 */
test.describe('Administrador', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' })

  test('el admin puede acceder al panel de recepción', async ({ page }) => {
    await page.goto('/panel-reception')
    // El admin tiene acceso al panel de recepción (roles: RECEPCIONISTA | ADMINISTRADOR)
    await expect(page.getByText(/disponible/i)).toBeVisible()
    await expect(page.getByText(/ocupad/i)).toBeVisible()
  })

  test('el admin ve el dashboard de ocupación completo', async ({ page }) => {
    await page.goto('/panel-reception')
    await expect(page.getByRole('heading', { name: /ocupación/i })).toBeVisible()
    await expect(page.getByText(/mantenimiento/i)).toBeVisible()
  })

  // ──── Tests para E4 (panel admin de usuarios) ────
  // Descomentar cuando se implemente /panel-admin/usuarios

  // test('crear un recepcionista y verlo en la lista', async ({ page }) => {
  //   const email = `recep_${Date.now()}@hmap.com`
  //   await page.goto('/panel-admin/usuarios')
  //   await page.getByRole('button', { name: /nuevo|crear usuario/i }).click()
  //   await page.getByLabel(/nombre/i).first().fill('Test')
  //   await page.getByLabel(/apellido/i).fill('Recep')
  //   await page.getByLabel(/correo|email/i).fill(email)
  //   await page.getByLabel(/contraseña|password/i).fill('secret123')
  //   await page.getByLabel(/rol/i).selectOption('RECEPCIONISTA')
  //   await page.getByRole('button', { name: /crear|guardar/i }).click()
  //   await expect(page.getByText(email)).toBeVisible()
  // })

  // test('correo duplicado muestra error de conflicto (409)', async ({ page }) => {
  //   await page.goto('/panel-admin/usuarios')
  //   await page.getByRole('button', { name: /nuevo|crear usuario/i }).click()
  //   await page.getByLabel(/nombre/i).first().fill('Dup')
  //   await page.getByLabel(/apellido/i).fill('Licado')
  //   await page.getByLabel(/correo|email/i).fill('recepcion@hmap.com')
  //   await page.getByLabel(/contraseña|password/i).fill('secret123')
  //   await page.getByLabel(/rol/i).selectOption('RECEPCIONISTA')
  //   await page.getByRole('button', { name: /crear|guardar/i }).click()
  //   await expect(page.getByText(/ya existe una cuenta con ese correo/i)).toBeVisible()
  // })

  // test('suspender a otro usuario', async ({ page }) => {
  //   await page.goto('/panel-admin/usuarios')
  //   const row = page.getByRole('row', { name: /recep_/i }).first()
  //   await row.getByRole('button', { name: /suspender|desactivar/i }).click()
  //   await expect(row.getByText(/inactiv|suspendid/i)).toBeVisible()
  // })

  // test('el admin no puede desactivarse a sí mismo', async ({ page }) => {
  //   await page.goto('/panel-admin/usuarios')
  //   const selfRow = page.getByRole('row', { name: /admin@hmap\.com/i })
  //   const toggle = selfRow.getByRole('button', { name: /suspender|desactivar/i })
  //   await expect(toggle).toBeDisabled()
  // })
})
