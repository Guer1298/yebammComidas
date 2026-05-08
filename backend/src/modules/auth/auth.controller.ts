import { NextFunction, Request, Response } from 'express'
import { loginSchema, registerSchema } from './auth.schemas'
import { getCurrentUser, loginUser, registerUser } from './auth.service'
import { AuthRequest } from '../../shared/middleware/auth'

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = registerSchema.parse(req.body)
    const result = await registerUser(payload)

    res.status(201).json({
      ok: true,
      message: 'Cuenta creada correctamente.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = loginSchema.parse(req.body)
    const result = await loginUser(payload)

    res.status(200).json({
      ok: true,
      message: 'Sesión iniciada correctamente.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function me(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({
        ok: false,
        message: 'Inicia sesión para continuar.',
      })
    }

    const userId = Number(req.user.sub)
    const user = await getCurrentUser(userId)

    res.status(200).json({
      ok: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}
