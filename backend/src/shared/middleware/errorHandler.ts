import { NextFunction, Request, Response } from 'express'
import { logger } from '../logger/logger'

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ err }, 'Unhandled application error')

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  })
}