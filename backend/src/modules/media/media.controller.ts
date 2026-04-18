import { NextFunction, Request, Response } from 'express'
import { uploadMedia } from './media.service'

export async function uploadMediaHandler(
  req: Request,
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