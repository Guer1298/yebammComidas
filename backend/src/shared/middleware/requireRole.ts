import { NextFunction, Response } from 'express'
import { AuthenticatedRequest } from './requireAuth'

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado',
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para realizar esta acción',
      })
    }

    next()
  }
}