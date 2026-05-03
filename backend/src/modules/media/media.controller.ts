import { NextFunction, Request, Response } from 'express'
import { setPrimaryMedia, uploadMedia } from './media.service'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'

function getActor(req: AuthenticatedRequest) {
  const userId = Number(req.user?.sub)

  if (!req.user || Number.isNaN(userId)) {
    const error = new Error('No autorizado')
    ;(error as any).status = 401
    throw error
  }

  return {
    userId,
    role: req.user.role,
  }
}

export async function uploadMediaHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: 'Archivo no enviado',
      })
    }

    const businessId = Number(req.body.businessId)
    const productId = req.body.productId ? Number(req.body.productId) : undefined
    const isPrimary = req.body.isPrimary === 'true'

    if (Number.isNaN(businessId)) {
      return res.status(400).json({
        ok: false,
        message: 'businessId es obligatorio y debe ser numérico',
      })
    }

    const media = await uploadMedia({
      businessId,
      productId,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      isPrimary,
      actor: getActor(req),
    })

    res.status(201).json({
      ok: true,
      message: 'Archivo subido correctamente',
      data: media,
    })
  } catch (error) {
    next(error)
  }
}

export async function setPrimaryMediaHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = Number(req.body.businessId)
    const mediaAssetId = Number(req.body.mediaAssetId)
    const isPrimary = req.body.isPrimary !== 'false'

    if (Number.isNaN(businessId) || Number.isNaN(mediaAssetId)) {
      return res.status(400).json({
        ok: false,
        message: 'businessId y mediaAssetId son obligatorios y deben ser numéricos',
      })
    }

    const media = await setPrimaryMedia({
      businessId,
      mediaAssetId,
      isPrimary,
      actor: getActor(req),
    })

    res.status(200).json({
      ok: true,
      message: 'Estado principal actualizado correctamente',
      data: media,
    })
  } catch (error) {
    next(error)
  }
}
