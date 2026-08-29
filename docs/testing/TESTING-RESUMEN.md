# Testing E2E — Resumen de implementación

Documentación de las pruebas automatizadas implementadas en el frontend
(`hmap-front`). Cubre tanto el contrato de la API (Vitest + fetch) como los
flujos de navegador (Playwright).

---

## Comandos

```bash
# Tests de contrato API (Vitest) — requiere backend en localhost:8080
$env:GUEST_EMAIL="cliente@hmap.com"; $env:GUEST_PASSWORD="cliente123"; npm run test:api

# Tests E2E de navegador (Playwright) — requiere backend + frontend
npm run e2e

# Playwright con UI interactiva (debug visual)
npm run e2e:ui

# Ver reporte HTML de la última corrida
npm run e2e:report
```

---

## 1. Tests de contrato API (`tests/api/`)

Stack: **Vitest** + `fetch` nativo (environment: node).

| Archivo | Descripción |
|---------|-------------|
| `tests/api/client.ts` | Cliente HTTP tipado (`api<T>()`, `login()`) |
| `tests/api/reception-flow.test.ts` | Flujo completo de recepción |

### Tests incluidos

| Test | Qué valida |
|------|------------|
| GET /rooms — Cloudinary | Las imágenes son URLs absolutas de `res.cloudinary.com` (regresión) |
| Login recepción | Obtiene un token JWT válido |
| GET /panel-reception/occupancy | Conteo por estado (`total = occupied + available + maintenance`) |
| Flujo reserva completo | PENDIENTE → CONFIRMADA → CHECK_IN → CHECK_OUT (ciclo completo) |
| GET /reservations/today | Devuelve `check_ins[]` y `check_outs[]` del día |
| Cancelar reserva PENDIENTE | El huésped cancela y queda CANCELADA |
| Cancelar reserva CHECK_IN | No se puede cancelar → error 400+ |
| Fechas inválidas | `check_out` antes de `check_in` → 400 |
| Capacidad excedida | Más guests que la capacidad → 400+ |
| Doble check-in | Segundo check-in → error |
| Token inválido | Token falso → 401 |
| Sin token | Endpoint protegido sin Authorization → 401 |
| Reserva inexistente | Confirmar ID 999999 → 404 |

### Configuración

- `vite.config.ts` → sección `test` con `environment: 'node'`, timeout 15s
- Variables de entorno: `API_URL` (default `http://localhost:8080`), `GUEST_EMAIL`, `GUEST_PASSWORD`

---

## 2. Tests E2E de navegador (`e2e/`)

Stack: **Playwright** (Chromium headless).

### Archivos

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `e2e/auth.setup.ts` | 2 | Login admin + recepción → guarda `storageState` |
| `e2e/public.spec.ts` | 4 | Home, catálogo, imágenes Cloudinary, disponibilidad |
| `e2e/auth.spec.ts` | 3 | Login inválido, registro nuevo cliente, login recepcionista |
| `e2e/client-reservations.spec.ts` | 4 | Consultar disponibilidad, crear reserva, ver mis reservas, cancelar reserva |
| `e2e/reception.spec.ts` | 7 | Dashboard, check-in/out, calendario, reservas, habitaciones, reserva manual, búsqueda |
| `e2e/admin.spec.ts` | 2 (+4 preparados para E4) | Acceso admin al panel de recepción |
| `e2e/route-guards.spec.ts` | 4 | Guardas: sin sesión redirige, recepcionista no entra a /panel, admin sí entra a /panel-reception |

**Total: 26 tests en 7 archivos.**

### Detalle por spec

#### `e2e/public.spec.ts` — Portal público

- La home carga y muestra el catálogo de habitaciones
- Las imágenes se sirven desde Cloudinary (regresión)
- La sección de búsqueda está presente
- `/disponibilidad` muestra resultados con parámetros

#### `e2e/auth.spec.ts` — Autenticación

- Login con credenciales inválidas muestra error y no redirige
- Registro de nuevo cliente redirige fuera de `/registro`
- Login de recepcionista redirige a `/panel-reception`

#### `e2e/client-reservations.spec.ts` — Cliente

- Registra un cliente de prueba (`beforeAll`)
- Consulta disponibilidad desde el panel del cliente
- Crea una reserva y verifica el código `RSV-`
- Verifica que aparece en "mis reservas"

#### `e2e/reception.spec.ts` — Recepción

- Dashboard muestra conteos (disponible, ocupadas, mantenimiento)
- Página de check-in/out carga la tabla
- Calendario de reservas carga
- Lista de reservas muestra tabla
- Gestión de habitaciones muestra tabla
- Botón "Nueva reserva" abre el modal
- Página de búsqueda carga

#### `e2e/admin.spec.ts` — Administrador

- El admin accede al panel de recepción (rol ADMINISTRADOR permitido)
- El admin ve el dashboard completo
- (Preparados 4 tests más para E4: CRUD usuarios, duplicado 409, suspender, autoprotección)

#### `e2e/route-guards.spec.ts` — Guardas de ruta

- Sin sesión → `/panel` redirige a `/login`
- Sin sesión → `/panel-reception` redirige a `/login`
- Recepcionista no puede entrar a `/panel` (rol CLIENTE)
- Admin SÍ puede entrar a `/panel-reception`

### Configuración

- `playwright.config.ts` → testDir `./e2e`, webServer levanta Vite automáticamente
- Auth reutilizable: `e2e/.auth/admin.json` y `e2e/.auth/reception.json` (storageState)
- `.gitignore` incluye `e2e/.auth/`, `playwright-report/`, `test-results/`

---

## 3. Requisitos para ejecutar

1. **Backend** corriendo en `http://localhost:8080` con migraciones aplicadas y seed de usuarios.
2. **Frontend** (Playwright lo levanta solo con `npm run dev`; para `test:api` no se necesita).
3. **Usuarios sembrados:**

| Rol | Email | Contraseña |
|-----|-------|-----------|
| ADMINISTRADOR | `admin@hmap.com` | `admin123` |
| RECEPCIONISTA | `recepcion@hmap.com` | `recepcion123` |
| CLIENTE | *(se registra en el test o por env var)* | — |

---

## 4. Dependencias instaladas

```json
{
  "devDependencies": {
    "vitest": "^4.1.10",
    "@playwright/test": "^1.x"
  }
}
```

---

## 5. Scripts en `package.json`

```json
{
  "scripts": {
    "test:api": "vitest run tests/api",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:report": "playwright show-report"
  }
}
```

---

## 6. Pendientes para Fase 4 (E4 — Panel Admin)

Tests que se implementarán cuando exista el panel de administración:

### Tests E2E (Playwright) — `e2e/admin.spec.ts`

Ya están escritos y comentados. Descomentar cuando se implemente `/panel-admin/usuarios`:

- [ ] **Crear un recepcionista** — llenar formulario, verificar que aparece en la lista
- [ ] **Correo duplicado (409)** — intentar crear con email existente, ver error
- [ ] **Suspender a otro usuario** — click suspender, verificar estado inactivo
- [ ] **Autoprotección** — el admin no puede desactivarse a sí mismo (botón disabled)

### Tests de API (Vitest) — por crear en `tests/api/admin-flow.test.ts`

- [ ] `POST /admin/users` — crear usuario con rol RECEPCIONISTA → 201
- [ ] `POST /admin/users` con email duplicado → 409
- [ ] `PATCH /admin/users/:id/status` — suspender usuario → 200
- [ ] `PATCH /admin/users/:id/status` sobre sí mismo → 409 (autoprotección)
- [ ] `GET /admin/users` — listar usuarios con paginación
- [ ] `GET /admin/users` sin rol ADMINISTRADOR → 403

### Otros pendientes de testing (mejoras)

- [ ] **Test de edición de reserva** — cliente edita fechas, se revalida disponibilidad
- [ ] **Test de acceso a reserva ajena** — un cliente intenta ver/editar reserva de otro → 403
- [ ] **Test de regresión Cloudinary más flexible** — verificar `https://` en vez de forzar Cloudinary (para desarrollo sin CDN)
- [ ] **Cleanup de datos** — implementar reset de BD de test entre corridas para aislamiento total

