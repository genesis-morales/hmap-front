/**
 * Setup para tests de API.
 * Carga las variables de entorno desde .env.test
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Cargar .env.test si existe
try {
  const envPath = resolve(process.cwd(), '.env.test')
  const envContent = readFileSync(envPath, 'utf-8')

  envContent.split('\n').forEach((line) => {
    line = line.trim()
    if (!line || line.startsWith('#')) return

    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').trim()

    if (key && value && !process.env[key]) {
      process.env[key] = value
    }
  })
} catch (error) {
  console.warn('No se pudo cargar .env.test, usando variables de entorno del sistema')
}
