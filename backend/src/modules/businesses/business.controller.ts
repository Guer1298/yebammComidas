import { NextFunction, Request, Response } from 'express'
import {
  createBusiness,
  deleteBusiness,
  getBusinessesForAdmin,
  getBusinessByIdWithUser,
  getBusinesses,
  toggleBusinessLike,
  updateBusinessProfileImage,
  updateBusiness,
} from './business.service'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'
import { verifyToken } from '../../shared/utils/jwt'
import { createBusinessSchema, updateBusinessProfileImageSchema } from './business.schemas'

function getOptionalUserId(req: Request) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return undefined
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyToken(token)
    const userId = Number(payload.sub)

    return Number.isNaN(userId) ? undefined : userId
  } catch {
    return undefined
  }
}

export async function findAllBusinesses(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const businesses = await getBusinesses()

    res.status(200).json({
      ok: true,
      data: businesses,
    })
  } catch (error) {
    next(error)
  }
}

export async function findAllBusinessesForAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.sub)

    if (!req.user || Number.isNaN(userId)) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado',
      })
    }

    const businesses = await getBusinessesForAdmin()

    res.status(200).json({
      ok: true,
      data: businesses,
    })
  } catch (error) {
    next(error)
  }
}

export async function findBusinessById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de negocio inválido',
      })
    }

    const business = await getBusinessByIdWithUser(id, getOptionalUserId(req))

    res.status(200).json({
      ok: true,
      data: business,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateBusinessHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de negocio inválido',
      })
    }

    const business = await updateBusiness(id, req.body)

    res.status(200).json({
      ok: true,
      message: 'Negocio actualizado correctamente',
      data: business,
    })
  } catch (error) {
    next(error)
  }
}

export async function createBusinessHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = Number(req.user?.sub)

    if (!req.user || Number.isNaN(userId)) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado',
      })
    }

    const payload = createBusinessSchema.parse(req.body)

    const created = await createBusiness({
      name: payload.name,
      category: payload.category,
      businessType: payload.businessType ?? null,
      description: payload.description ?? null,
      aboutArticle: payload.aboutArticle ?? null,
      city: payload.city ?? null,
      address: payload.address ?? null,
      phone: payload.phone ?? null,
      whatsapp: payload.whatsapp ?? null,
      email: payload.email ?? null,
      website: payload.website ?? null,
      instagram: payload.instagram ?? null,
      facebook: payload.facebook ?? null,
      tiktok: payload.tiktok ?? null,
      coverImageUrl: payload.coverImageUrl ?? null,
      adminEmail: payload.adminEmail,
      adminPassword: payload.adminPassword,
      creatorUserId: userId,
      creatorDisplayName: payload.creatorDisplayName || 'Super administrador',
    })

    res.status(201).json({
      ok: true,
      message: 'Negocio creado correctamente',
      data: created,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateBusinessProfileImageHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = Number(req.params.id)

    if (Number.isNaN(businessId)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de negocio inválido',
      })
    }

    const userId = Number(req.user?.sub)

    if (!req.user || Number.isNaN(userId)) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado',
      })
    }

    const payload = updateBusinessProfileImageSchema.parse(req.body)

    const business = await updateBusinessProfileImage({
      businessId,
      profileImageUrl: payload.profileImageUrl,
      actor: {
        userId,
        role: req.user.role,
      },
    })

    res.status(200).json({
      ok: true,
      message: 'Foto de perfil actualizada correctamente.',
      data: business,
    })
  } catch (error) {
    next(error)
  }
}

export async function toggleBusinessLikeHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = Number(req.params.id)

    if (Number.isNaN(businessId)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de negocio inválido',
      })
    }

    const userId = Number(req.user?.sub)

    if (!req.user || Number.isNaN(userId)) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado',
      })
    }

    const result = await toggleBusinessLike(businessId, userId)

    res.status(200).json({
      ok: true,
      message: result.hasLiked ? 'Like agregado correctamente' : 'Like eliminado correctamente',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteBusinessHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = Number(req.params.id)

    if (Number.isNaN(businessId)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de negocio inválido',
      })
    }

    const deleted = await deleteBusiness(businessId)

    res.status(200).json({
      ok: true,
      message: 'Negocio eliminado correctamente',
      data: deleted,
    })
  } catch (error) {
    next(error)
  }
}
