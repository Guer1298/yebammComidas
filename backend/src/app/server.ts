import dotenv from 'dotenv'
dotenv.config()

import app from './app'
import { logger } from '../shared/logger/logger'

const PORT = Number(process.env.PORT) || 3000

const server = app.listen(PORT, () => {
  logger.info(`Backend running on http://localhost:${PORT}`)
})

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection')
  process.exit(1)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})