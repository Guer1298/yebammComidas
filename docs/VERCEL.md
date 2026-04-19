# Deploy en Vercel

Este repo se despliega mejor como **dos proyectos de Vercel** dentro del mismo monorepo:

- `proyectoc/frontend` -> frontend React
- `proyectoc/backend` -> backend Express

## 1. Frontend

En Vercel crea un proyecto nuevo con:

- `Root Directory`: `proyectoc/frontend`
- `Build Command`: `npm run build`
- `Output Directory`: `dist`

Variables de entorno:

```bash
VITE_API_URL=https://tu-backend.vercel.app/api
```

El archivo `proyectoc/frontend/vercel.json` ya tiene el rewrite para rutas SPA.

## 2. Backend

En Vercel crea otro proyecto con:

- `Root Directory`: `proyectoc/backend`

El backend ya exporta Express desde `src/index.ts`, así que Vercel lo puede detectar como función.

Variables de entorno:

```bash
DATABASE_URL=postgresql://...
FRONTEND_URL=https://tu-frontend.vercel.app
JWT_SECRET=una-clave-larga-y-segura
NODE_ENV=production
```

Si usas Cloudinary:

```bash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 3. Orden recomendado

1. Crear la base de datos.
2. Desplegar el backend.
3. Copiar la URL pública del backend.
4. Desplegar el frontend con `VITE_API_URL` apuntando al backend.

## 4. Nota importante

No intentes servir frontend y backend como una sola app monolítica en Vercel con este repo actual.
La separación por proyectos es la ruta más simple y estable.
