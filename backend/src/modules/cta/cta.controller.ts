import { NextFunction, Request, Response } from 'express'
import { registerCtaClick } from './cta.service'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'

export async function registerCtaClickHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { businessId, productId, sourceScreen } = req.body

    if (!businessId || Number.isNaN(Number(businessId))) {
      return res.status(400).json({
        ok: false,
        message: 'businessId es obligatorio',
      })
    }

    if (!sourceScreen || typeof sourceScreen !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'sourceScreen es obligatorio',
      })
    }

    const result = await registerCtaClick({
      userId: req.user?.sub ?? null,
      businessId: Number(businessId),
      productId: productId ? Number(productId) : null,
      sourceScreen,
    })

    res.status(201).json({
      ok: true,
      message: 'CTA registrado correctamente',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}