import { NextFunction, Request, Response } from 'express'
import { createReview, getReviewsByBusinessId } from './reviews.service'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'

export async function findReviewsByBusinessId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = Number(req.params.id)

    if (Number.isNaN(businessId)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona un negocio válido.',
      })
    }

    const result = await getReviewsByBusinessId(businessId)

    res.status(200).json({
      ok: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function createReviewHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.sub

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Inicia sesión para continuar.',
      })
    }

    const { businessId, rating, comment } = req.body

    if (!businessId || Number.isNaN(Number(businessId))) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona el negocio que quieres reseñar.',
      })
    }

    const review = await createReview({
      businessId: Number(businessId),
      userId,
      rating: Number(rating),
      comment,
    })

    res.status(201).json({
      ok: true,
      message: 'Reseña publicada correctamente.',
      data: review,
    })
  } catch (error) {
    next(error)
  }
}
