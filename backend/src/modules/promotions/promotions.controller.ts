import { NextFunction, Request, Response } from 'express'
import { PromotionStatus } from '@prisma/client'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'
import {
  createPromotion,
  deactivatePromotion,
  getPromotionById,
  listPromotions,
  listPromotionsByBusinessId,
  updatePromotion,
} from './promotions.service'

type PromotionStatusFilter = PromotionStatus | 'ALL'

function getActor(req: AuthenticatedRequest) {
  const userId = Number(req.user?.sub)

  if (!req.user || Number.isNaN(userId)) {
    const error = new Error('Inicia sesión para continuar.')
    ;(error as any).status = 401
    throw error
  }

  return {
    userId,
    role: req.user.role,
  }
}

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseStatus(
  value: unknown
): PromotionStatusFilter | null | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.toUpperCase()

  if (normalized === 'ALL') {
    return 'ALL'
  }

  if (Object.values(PromotionStatus).includes(normalized as PromotionStatus)) {
    return normalized as PromotionStatus
  }

  return null
}

export async function findAllPromotions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = parseOptionalNumber(req.query.businessId)
    const status = parseStatus(req.query.status)

    if (businessId === null || status === null) {
      return res.status(400).json({
        ok: false,
        message: 'Los filtros de promociones no son válidos.',
      })
    }

    const promotions = await listPromotions({
      businessId,
      status: status || undefined,
    })

    res.status(200).json({
      ok: true,
      data: promotions,
    })
  } catch (error) {
    next(error)
  }
}

export async function findPromotionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona una promoción válida.',
      })
    }

    const promotion = await getPromotionById(id)

    res.status(200).json({
      ok: true,
      data: promotion,
    })
  } catch (error) {
    next(error)
  }
}

export async function findPromotionsByBusinessId(
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

    const promotions = await listPromotionsByBusinessId(businessId)

    res.status(200).json({
      ok: true,
      data: promotions,
    })
  } catch (error) {
    next(error)
  }
}

export async function createPromotionHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const promotion = await createPromotion(req.body, getActor(req))

    res.status(201).json({
      ok: true,
      message: 'Promoción creada correctamente.',
      data: promotion,
    })
  } catch (error) {
    next(error)
  }
}

export async function updatePromotionHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona una promoción válida.',
      })
    }

    const promotion = await updatePromotion(id, req.body, getActor(req))

    res.status(200).json({
      ok: true,
      message: 'Promoción actualizada correctamente.',
      data: promotion,
    })
  } catch (error) {
    next(error)
  }
}

export async function deactivatePromotionHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona una promoción válida.',
      })
    }

    const promotion = await deactivatePromotion(id, getActor(req))

    res.status(200).json({
      ok: true,
      message: 'Promoción desactivada correctamente.',
      data: promotion,
    })
  } catch (error) {
    next(error)
  }
}
