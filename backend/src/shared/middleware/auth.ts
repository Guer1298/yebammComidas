import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: {
    sub: number
    email: string
    role: string
  }
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'Token no proporcionado',
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