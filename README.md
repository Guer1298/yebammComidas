# ProyectoC

Plataforma web para descubrir negocios de comida, explorar su carta, ver productos, revisar promociones y entrar al panel de administracion.

El proyecto esta dividido en dos aplicaciones:

- `backend`: API en Node.js + Express + Prisma + PostgreSQL
- `frontend`: React + Vite + TypeScript + Tailwind CSS

## Stack

- Frontend: React, React Router, Vite, TypeScript, Tailwind CSS, Axios
- Backend: Node.js, Express, Prisma, PostgreSQL, Zod
- Auth: JWT
- Media: soporte para Cloudinary

## Estructura

```text
proyectoc/
  backend/
  frontend/
  docs/
```

### Frontend

```text
frontend/src/
  app/          # router, layouts, guards
  components/   # UI reutilizable
  features/     # dominios de producto
  hooks/        # hooks compartidos
  lib/          # cliente API, session, helpers
  pages/        # compatibilidad temporal
```

### Backend

```text
backend/src/modules/
  auth/
  businesses/
  products/
  reviews/
  media/
  promotions/
  analytics/
  cta/
```

## Funcionalidades

### Publico

- Inicio con buscador real de negocios y platos
- Listado y detalle de negocios
- Carta por negocio
- Detalle de producto
- Galeria de media
- Reseñas de negocio
- Promociones activas

### Panel administrativo

- Dashboard
- Edicion de negocio
- Gestion de productos
- Gestion de media
- Gestion de promociones

### Backend

- Autenticacion con JWT
- CRUD de negocios y productos
- Reseñas por negocio
- Eventos de analitica
- Promociones
- Carga de media

## Requisitos

- Node.js `20.19+` recomendado
- PostgreSQL
- Variables de entorno configuradas en frontend y backend

## Variables de entorno

### Backend

Crear `proyectoc/backend/.env` con algo similar a:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/proyectoc"
JWT_SECRET="cambia-esto-en-desarrollo"
FRONTEND_URL="http://localhost:5173"
PORT=3000
LOG_LEVEL=debug

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Frontend

Crear `proyectoc/frontend/.env` con:

```env
VITE_API_URL="http://localhost:3000/api"
```

Si no defines `VITE_API_URL`, el frontend usa `http://localhost:3000/api` por defecto.

## Instalacion

### 1. Instalar dependencias

```bash
cd proyectoc/backend
npm install

cd ../frontend
npm install
```

### 2. Configurar base de datos

En `backend/.env`, ajusta `DATABASE_URL` a tu PostgreSQL local o remoto.

### 3. Generar Prisma

```bash
cd proyectoc/backend
npm run prisma:generate
```

### 4. Ejecutar migraciones

```bash
cd proyectoc/backend
npm run prisma:migrate
```

### 5. Cargar datos de prueba

```bash
cd proyectoc/backend
npm run prisma:seed
```

## Ejecucion en desarrollo

Abre dos terminales.

### Backend

```bash
cd proyectoc/backend
npm run dev
```

El backend corre en `http://localhost:3000`.

### Frontend

```bash
cd proyectoc/frontend
npm run dev
```

El frontend corre en `http://localhost:5173`.

## Scripts

### Frontend

- `npm run dev`: levanta Vite
- `npm run build`: compila TypeScript y genera el build
- `npm run lint`: ejecuta ESLint
- `npm run preview`: previsualiza el build

### Backend

- `npm run dev`: levanta Express con recarga
- `npm run build`: compila TypeScript
- `npm run start`: ejecuta el build compilado
- `npm run prisma:generate`: genera el cliente Prisma
- `npm run prisma:migrate`: crea/aplica migraciones
- `npm run prisma:studio`: abre Prisma Studio
- `npm run prisma:seed`: carga datos demo

## Rutas principales

### Publicas

- `/` inicio
- `/businesses` listado de negocios
- `/businesses/:id` detalle del negocio
- `/businesses/:id/menu` carta completa
- `/businesses/:id/gallery` galeria
- `/products/:id` detalle del producto
- `/promotions` promociones activas
- `/login` iniciar sesion
- `/register` registro

### Admin

- `/admin`
- `/admin/business`
- `/admin/products`
- `/admin/media`
- `/admin/promotions`

## API principal

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Negocios

- `GET /api/businesses`
- `GET /api/businesses/:id`
- `PATCH /api/businesses/:id`

### Productos

- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/deactivate`

### Reviews

- `GET /api/businesses/:id/reviews`
- `POST /api/reviews`

### Promociones

- `GET /api/promotions`
- `GET /api/promotions/:id`
- `GET /api/businesses/:id/promotions`
- `POST /api/promotions`
- `PATCH /api/promotions/:id`
- `PATCH /api/promotions/:id/deactivate`

### Media

- `GET /api/media`
- `POST /api/media/upload`

### Analitica y eventos

- `POST /api/events`

### CTA

- `POST /api/cta/click`

## Roles

- `CONSUMER`: usuario final
- `BUSINESS_ADMIN`: administrador de negocio
- `ADMIN`: administrador general

## Datos demo

El seed crea datos de ejemplo para desarrollo local, incluidos negocios, productos, promociones y usuarios administradores.

Si necesitas ver o ajustar las credenciales de prueba, revisa:

- `proyectoc/backend/prisma/seed.ts`

## Notas de arquitectura

- El frontend esta organizado por `features/` para alinear cada dominio con el backend.
- La vista publica de negocio prioriza claridad visual, y la carta completa se abre en `/businesses/:id/menu`.
- Las reseñas solo se pueden publicar con sesion iniciada.
- El panel admin usa datos reales del backend y evita mocks en lo posible.

## Problemas conocidos

- Vite requiere Node `20.19+` o `22.12+`. Si usas una version menor, el build puede funcionar pero mostrara warning.
- La app depende de una base PostgreSQL activa para funcionar correctamente.

## Flujo recomendado

1. Levantar PostgreSQL.
2. Configurar `backend/.env`.
3. Ejecutar `prisma:generate`, `prisma:migrate` y `prisma:seed`.
4. Levantar backend.
5. Levantar frontend.
6. Entrar a `/login` y navegar a `/admin` o explorar el sitio publico.
