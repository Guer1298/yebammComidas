import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'


import authRoutes from '../modules/auth/auth.routes'
import businessRoutes from '../modules/businesses/business.routes'
import productsRoutes from '../modules/products/products.routes'
import analyticsRoutes from '../modules/analytics/analytics.routes'
import mediaRoutes from '../modules/media/media.routes'
import promotionsRoutes from '../modules/promotions/promotions.routes'
import adminRoutes from '../modules/admin/admin.routes'

import { logger } from '../shared/logger/logger'
import { notFound } from '../shared/middleware/notFound'
import { errorHandler } from '../shared/middleware/errorHandler'
import reviewsRoutes from '../modules/reviews/reviews.routes'
import ctaRoutes from '../modules/cta/cta.routes'

const app = express()

app.set('trust proxy', 1)

// Seguridad básica HTTP
app.use(helmet())

// CORS controlado por entorno
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// Parsing JSON con límite
app.use(express.json({ limit: '1mb' }))

// Logging estructurado por request
app.use(
  pinoHttp({
    logger,
  })
)

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    status: 'up',
    service: 'proyectoc-backend',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// Rutas API
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/businesses', businessRoutes)
app.use('/api/events', analyticsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api', reviewsRoutes)
app.use('/api', promotionsRoutes)
app.use('/api/cta', ctaRoutes)

// Middleware 404
app.use(notFound)

// Middleware global de errores
app.use(errorHandler)

export default app
