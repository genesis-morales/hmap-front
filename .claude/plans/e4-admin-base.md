# E4 — Panel de Administrador

Implementación del panel admin (HU-030 → HU-034, RF-015) según las cuatro
pantallas aportadas, sobre el contrato ya documentado en `docs/FE-ADMIN.md`.

## Pantallas

1. **Usuarios** — tabs Todos/Activos/Inactivos, buscador en la topbar, tabla
   (Nombre con avatar · Correo · Rol · Estado · Acciones), footer
   "Mostrando X de Y usuarios" + paginación, botón "+ Nuevo usuario".
2. **¿Desactivar usuario?** — confirmación con resumen de la cuenta y su estado actual.
3. **Editar usuario** — nombre, correo (bloqueado), Rol + Estado.
4. **Nuevo usuario** — nombre, correo, contraseña + confirmación, Rol, Estado fijo en Activo.

## Reglas de negocio acordadas

- **Clientes**: solo activar/desactivar. No se editan ni se crean desde aquí.
- **Recepcionistas y administradores**: alta y edición completas.
- Select de rol: `RECEPCIONISTA` | `ADMINISTRADOR` (el backend rechaza `CLIENTE` con 400).
- Nombre en dos campos (`name` + `last_name`), consistente con registro y perfil.
- Correo editable solo al crear; en edición se muestra deshabilitado porque
  `PUT /users/{id}` no lo acepta.
- "Estado" en el modal de edición dispara un `PATCH /users/{id}/active` extra
  **solo si cambió**.
- El ícono de basurero **desactiva**, no borra (no existe `DELETE /users`).
- **Autoprotección**: sobre la propia cuenta del admin logueado se deshabilita
  desactivar y cambiar de rol, para evitar el 409 documentado.

## Paso 1 — Componentes genéricos a `shared`

`PageHeader`, `StatCard` y `GuestAvatar` viven en `features/reception/components/`
pero son del panel interno en general. Se mueven a `src/shared/components/`;
`GuestAvatar` → `UserAvatar` (ya no es solo huéspedes), misma API más un alias
para no tocar las llamadas existentes. `PageResponse<T>` pasa de
`features/reception/types.ts` a `src/shared/api/types.ts`, con reexport para no
romper imports.

## Paso 2 — `PanelLayout` compartido

`ReceptionLayout`+`ReceptionSidebar` y `ClientLayout`+`ClientSidebar` son hoy el
mismo componente duplicado. Nuevo `src/shared/layouts/PanelLayout/`:

- `PanelLayout.tsx` — sidebar fija + `PanelTopbar` + `Drawer` móvil + `<Outlet />`.
  Props: `navItems`, `title`, `brandCaption`, `roleLabel`, `searchPlaceholder?`, `onSearch?`.
- `PanelSidebar.tsx` — brand, nav, footer con avatar y logout. Un item es
  `{ to, label, icon, isActive?, visible?: (role) => boolean }`; `visible`
  habilita el enlace cruzado por rol.
- SCSS consolidado bajo `panel-layout__*` / `panel-sidebar__*`.

Alcance: **solo recepción y admin**. `ClientLayout` se queda como está —
panel estable, sin topbar de búsqueda; migrarlo ahora amplía el riesgo sin
beneficio. Queda como seguimiento.

## Paso 3 — API, tipos y errores

- `features/admin/types.ts` — `AdminUser`, `CreateUserRequest`,
  `UpdateUserRequest`, `AssignableRole`, `UserQuery`.
- `features/admin/api/adminUsers.api.ts` — `list`, `create`, `update`, `setActive`.
- `features/admin/lib/userRole.ts` — etiquetas y tonos de rol y de estado,
  al estilo de `lib/roomStatus.ts`.
- `shared/api/client.ts` — `getErrorMessage` gana fallback a `ProblemDetail.detail`
  (el contrato admin no usa `message`), y se añade `getFieldErrors()` para pintar
  errores por campo. Cambio compatible con lo existente.

## Paso 4 — Ruta y navegación

- `AdminLayout` sobre `PanelLayout`, caption "Administración".
- `/panel-admin` en `router.tsx` con `<RequireAuth roles={['ADMINISTRADOR']}>`,
  hijo `usuarios`, index redirige a `usuarios`.
- Enlace cruzado: item "Administración" en el sidebar de recepción visible solo
  si `role === 'ADMINISTRADOR'`; item "Panel de recepción" en el sidebar admin.
- `homePathForRole` **no** cambia: el admin sigue entrando a `/panel-reception`,
  como asumen los tests E2E actuales.

## Paso 5 — Páginas y modales

`UsersPage` en el patrón de `ReservationsPage` (tabs → `active`, búsqueda por
query param, paginación server-side), más `UserFormModal` (alta/edición) y
`ToggleActiveModal` (confirmación).

## Verificación

`npm run build`, `npm run lint`, y los specs `reception.spec.ts` /
`route-guards.spec.ts` para confirmar que el refactor de layout no rompió
recepción. Los e2e requieren backend en :8080; si no está disponible lo reporto
en vez de asumirlo.

## Fuera de alcance (seguimiento)

- Migrar `ClientLayout` a `PanelLayout`.
- Página de perfil del admin (el sidebar muestra el rol estático en vez del
  enlace "Ver mi perfil" del mockup, que no tendría destino).
- Cierre transversal del E4: centralizar el 401 en `AuthContext`, Vitest +
  Testing Library para lógica pura, descomentar los 4 tests de `e2e/admin.spec.ts`.
