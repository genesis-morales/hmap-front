# Plan de Entregables
**Proyecto:** Herramienta web para la gestión de reservas y recepción — Hotel Manuel Antonio Park (HMAP)

Cuatro entregables. Cada uno agrupa historias de usuario (HU) y requerimientos funcionales (RF) que se completan de punta a punta (API + Frontend), de modo que al cierre de cada entrega hay funcionalidad demostrable.

Convención: ver contrato de endpoints en [api-contrato.md](./api-contrato.md).

---

## Entregable 1 — Portal Público + Autenticación ✅ (completado)

| Área | Alcance |
|---|---|
| **FE** | Portal público: página principal, secciones (habitaciones, amenidades, galería, testimonios, ubicación), detalle de habitación. Auth: registro, login/logout, recuperar y restablecer contraseña, contexto de sesión (JWT). |
| **API** | Registro, login (JWT), `me`, forgot/reset password. Cifrado BCrypt. Correo de recuperación. |

**HU:** HU-001, HU-002, HU-003, HU-004, HU-005, HU-006, HU-038
**RF:** RF-001, RF-002, RF-003, RF-004, RF-005
**RNF cubiertos:** RNF-007 (BCrypt), RNF-008 (JWT)

---

## Entregable 2 — Portal del Cliente + Motor de Reservas

El corazón del sistema: el cliente puede buscar disponibilidad, reservar y gestionar sus reservas. Incluye la base de datos de habitaciones (necesaria para calcular disponibilidad) aunque su CRUD administrativo llega en el Entregable 3.

> **Estado:** API ✅ completada (ver [E2-RESERVAS.md](./E2-RESERVAS.md)) · FE ✅ completado.
>
> FE cubierto: layout del panel + ruta protegida por rol (`RequireAuth`), inicio del portal (HU-007),
> disponibilidad compartida público/panel con persistencia por login (RF-006/RNF-006), confirmación
> (HU-009), listado/detalle/edición/cancelación de reservas (HU-010→013), perfil y cambio de
> contraseña (HU-014/015). Imágenes de habitaciones: el FE ya consume `/rooms`; el servido definitivo
> vía CDN (`IMAGES_BASE_URL`) se resuelve en backend, con respaldo local por `slug` en el FE.

| Área | Alcance |
|---|---|
| **FE** | Layout del panel cliente + ruta protegida por rol. Inicio del portal (HU-007). Perfil y cambio de contraseña. Buscador de disponibilidad **compartido** entre portal público (RF-006) y panel cliente (HU-008), con persistencia de la selección previa al pasar por login (RNF-006). Flujo de confirmación de reserva. Listado, detalle, edición y cancelación de reservas propias. |
| **API** | Actualizar perfil y cambiar contraseña. Habitaciones (lectura, servidas desde BD — migrar el catálogo hoy hardcodeado en el FE). Disponibilidad por fechas/huéspedes. CRUD de reservas del cliente con reglas de negocio (validación de solapamiento, límites de tiempo para editar/cancelar, estados de reserva). Correos de confirmación y cancelación. |

**HU:** HU-007, HU-008, HU-009, HU-010, HU-011, HU-012, HU-013, HU-014, HU-015, HU-035, HU-036
**RF:** RF-006, RF-007, RF-008, RF-009, RF-010 (+ parte de RF-016)
**RNF foco:** RNF-006 (persistencia de selección), RNF-002/003 (usabilidad y responsive del panel)

**Dependencias clave:**
- El endpoint de disponibilidad exige que las habitaciones vivan en la BD → la migración del catálogo se hace aquí, no en el E3.
- Las políticas de edición/cancelación (plazos) se definen y validan en la API; el FE solo refleja `can_edit` / `can_cancel`.

---

## Entregable 3 — Panel de Recepcionista

Operación interna diaria: ocupación, calendario, check-in/out, reservas manuales y mantenimiento del inventario de habitaciones.

| Área | Alcance |
|---|---|
| **FE** | Layout del panel interno (compartible con el panel admin del E4). Panel de recepción con ocupación en tiempo real. Calendario de reservas (mensual/diario). Lista de check-ins/check-outs del día + registro de check-in/out. Tabla global de reservas con búsqueda y filtros; crear/editar/cancelar reserva manual. CRUD de habitaciones y cambio de estado (disponible/ocupada/mantenimiento). |
| **API** | Métricas de ocupación (`/panel-reception/occupancy`). Consulta de reservas global (filtros por nombre, id, fechas). Reservas manuales (creación a nombre de un cliente). Check-in/check-out con transición de estado de habitación. CRUD completo de habitaciones + estados, con regla de no eliminar habitaciones con transacciones activas. Correo de reserva manual. |

**HU:** HU-016 → HU-029, HU-037
**RF:** RF-011, RF-012, RF-013, RF-014 (+ parte de RF-016)
**RNF foco:** RNF-004 (rendimiento del panel de recepción/calendario)

**Dependencias clave:** requiere el motor de reservas del E2 (misma entidad, se agregan estados operativos: check-in, check-out).

---

## Entregable 4 — Panel de Administrador + Cierre

Gestión de usuarios internos, control de acceso por roles consolidado y cierre de calidad del sistema completo.

| Área | Alcance |
|---|---|
| **FE** | Panel admin: listado de usuarios, crear/editar usuario interno, asignación de rol, activar/desactivar cuenta. Guardas de ruta por rol consolidadas (CLIENTE / RECEPCIONISTA / ADMINISTRADOR). Pulido responsive y de usabilidad transversal. |
| **API** | CRUD de usuarios internos, asignación de roles, activación/suspensión. Autorización por rol en todos los endpoints (revisión transversal). |
| **Cierre** | Verificación de RNFs: seguridad y control de acceso (RNF-001), usabilidad (RNF-002), responsive (RNF-003), rendimiento (RNF-004), disponibilidad (RNF-005). Pruebas de flujo completo y documentación final. Nota: el panel de recepción usa la ruta `/panel-reception` (no `/dashboard`). |

**Tareas técnicas diferidas del E2** (detectadas en la revisión de legibilidad; se cierran aquí por ser transversales de calidad/seguridad):
- Introducir runner de pruebas (Vitest + Testing Library) y cubrir la lógica pura del E2 —`staySearch`, `stay`, `reservationUi`— y el flujo RNF-006 (búsqueda que sobrevive al login).
- Centralizar el manejo de `401`: redirigir a login y/o limpiar el `user` del `AuthContext` para que la sesión expirada se refleje de inmediato (hoy el interceptor solo borra el token). Parte del cierre de RNF-001.

**HU:** HU-030, HU-031, HU-032, HU-033, HU-034
**RF:** RF-015
**RNF foco:** RNF-001 y verificación final de todos los RNF

---

## Resumen de cobertura

| Entregable | HU | RF | Estado |
|---|---|---|---|
| E1 — Público + Auth | 001–006, 038 | 001–005 | ✅ Completado |
| E2 — Portal Cliente + Reservas | 007–015, 035, 036 | 006–010, 016* | ✅ Completado |
| E3 — Panel Recepcionista | 016–029, 037 | 011–014, 016* | Pendiente |
| E4 — Panel Admin + Cierre | 030–034 | 015 | Pendiente |

\* RF-016 (notificaciones por correo) se reparte: cada entregable implementa los correos de sus propios flujos.

**Total: 38 HU / 16 RF — todas cubiertas.**
