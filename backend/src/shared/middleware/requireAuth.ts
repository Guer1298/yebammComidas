import { NextFunction, Request, Response } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'No autorizado',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyToken(token)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado',
    })
  }
}