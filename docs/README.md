# Documentación del Proyecto

## Referencia

- [api-contrato.md](reference/api-contrato.md) - Contrato de endpoints de la API
- [hu.md](reference/hu.md) - Historias de usuario
- [requerimientos.md](reference/requerimientos.md) - Requerimientos funcionales y no funcionales

## Arquitectura

El frontend está organizado por features:

- **auth** - Autenticación, registro, recuperación de contraseña
- **client** - Portal del cliente (búsqueda, reservas, perfil)
- **reception** - Panel de recepción (ocupación, check-in/out, calendario)
- **admin** - Panel de administración (gestión de usuarios)
- **rooms** - Catálogo público de habitaciones
- **shared** - Componentes, hooks y utilidades compartidas

## Patrones de Código

### Manejo de Errores

Usar `applyApiError()` para formularios con validación campo por campo:

```typescript
try {
  await api.create(values)
} catch (error) {
  applyApiError(error, form, 'Error al crear el recurso')
}
```

### Modales

Usar componentes compartidos de `shared/components/Modal`:

- `ConfirmModal` - Confirmaciones simples
- `FormModal` - Formularios en modal

### Autenticación

El contexto `AuthContext` maneja la sesión. `RequireAuth` protege rutas por rol:

```typescript
<RequireAuth roles={['ADMINISTRADOR']}>
  <AdminPanel />
</RequireAuth>
```
