import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test('login inválido muestra error y no redirige', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill('nadie@hmap.com')
    await page.getByLabel(/contraseña|password/i).fill('malaclave')
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page.getByText(/credenciales|inválid|incorrect/i)).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('registro de un nuevo cliente e ingreso al portal', async ({ page }) => {
    const email = `cliente_${Date.now()}@hmap.com`
    await page.goto('/registro')
    await page.getByLabel(/nombre/i).first().fill('Nuevo')
    await page.getByLabel(/apellido/i).fill('Cliente')
    await page.getByLabel(/correo|email/i).fill(email)
    await page.getByLabel(/contraseña|password/i).fill('Secret123!')
    await page.getByRole('button', { name: /registrar|crear cuenta/i }).click()
    // Debe redirigir fuera de /registro tras registro exitoso
    await expect(page).not.toHaveURL(/\/registro$/)
  })

  test('login válido de recepcionista redirige al panel', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/correo|email/i).fill('recepcion@hmap.com')
    await page.getByLabel(/contraseña|password/i).fill('recepcion123')
    await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
    await expect(page).toHaveURL(/\/panel-reception/)
  })
})
