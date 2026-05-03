import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { logger } from '../logger/logger'

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      message: 'Datos inválidos',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  logger.error({ err }, 'Unhandled application error')

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  })
}
