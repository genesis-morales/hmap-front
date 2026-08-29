import { test as setup, expect } from '@playwright/test'

const CREDS = {
  admin: { email: 'admin@hmap.com', password: 'admin123' },
  reception: { email: 'recepcion@hmap.com', password: 'recepcion123' },
}

async function loginAndSave(
  page: import('@playwright/test').Page,
  baseURL: string,
  email: string,
  password: string,
  file: string,
) {
  await page.goto(`${baseURL}/login`)
  await page.getByLabel(/correo|email/i).fill(email)
  await page.getByLabel(/contraseña|password/i).fill(password)
  await page.getByRole('button', { name: /iniciar sesión|entrar|login/i }).click()
  // Espera a que el login haya redirigido
  await expect(page).not.toHaveURL(/\/login$/)
  await page.context().storageState({ path: file })
}

setup('authenticate as admin', async ({ page, baseURL }) => {
  await loginAndSave(
    page,
    baseURL!,
    CREDS.admin.email,
    CREDS.admin.password,
    'e2e/.auth/admin.json',
  )
})

setup('authenticate as reception', async ({ page, baseURL }) => {
  await loginAndSave(
    page,
    baseURL!,
    CREDS.reception.email,
    CREDS.reception.password,
    'e2e/.auth/reception.json',
  )
})
