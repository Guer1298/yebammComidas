import { NextFunction, Request, Response } from 'express'
import { setPrimaryMedia, uploadMedia } from './media.service'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'

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
        message: 'Selecciona un archivo para subir.',
      })
    }

    const businessId = Number(req.body.businessId)
    const productId = req.body.productId ? Number(req.body.productId) : undefined
    const isPrimary = req.body.isPrimary === 'true'

    if (Number.isNaN(businessId)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona un negocio válido antes de subir el archivo.',
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
      message: 'Archivo subido correctamente.',
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
        message: 'Selecciona un negocio y un recurso visual válidos.',
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
      message: 'Recurso principal actualizado correctamente.',
      data: media,
    })
  } catch (error) {
    next(error)
  }
}
