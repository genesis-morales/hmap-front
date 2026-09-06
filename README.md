# HMAP Frontend

Frontend de la plataforma de gestión de reservas y recepción del Hotel Manuel Antonio Park.

## Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite** - Build tool y dev server
- **Ant Design** - Component library
- **React Router 7** - Routing
- **Axios** - HTTP client
- **SCSS** - Estilos

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

\`\`\`bash
npm install
\`\`\`

## Configuración

Copia \`.env.example\` a \`.env\` y configura:

\`\`\`env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=tu_api_key
\`\`\`

## Desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en http://localhost:5173

## Build para Producción

\`\`\`bash
npm run build
\`\`\`

Los archivos optimizados se generan en \`dist/\`

## Tests

\`\`\`bash
# Tests E2E con Playwright
npm run test:e2e

# Tests de integración API
npm run test:api
\`\`\`

## Estructura del Proyecto

\`\`\`
src/
├── app/           # Configuración de la app y router
├── features/      # Módulos por funcionalidad
│   ├── auth/      # Autenticación y autorización
│   ├── client/    # Portal del cliente
│   ├── reception/ # Panel de recepción
│   ├── admin/     # Panel de administración
│   └── rooms/     # Catálogo de habitaciones
└── shared/        # Componentes y utilidades compartidas
\`\`\`

## Roles y Permisos

- **CLIENTE** - Portal de cliente (\`/panel\`)
- **RECEPCIONISTA** - Panel de recepción (\`/panel-reception\`)
- **ADMINISTRADOR** - Panel de administración (\`/panel-admin\`) + acceso a recepción

## Deploy

El frontend es una SPA estática. Puede desplegarse en cualquier servicio de hosting estático:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx/Apache

Asegúrate de configurar el fallback a \`index.html\` para que el routing del lado del cliente funcione correctamente.

## Licencia

Proyecto de graduación - Universidad Fidélitas
