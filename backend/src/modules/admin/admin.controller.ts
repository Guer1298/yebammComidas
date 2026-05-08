import { NextFunction, Response } from 'express'
import { AuthenticatedRequest } from '../../shared/middleware/requireAuth'
import {
  createBusinessAdmin,
  deleteBusinessAdmin,
  getAdminDashboard,
  getBusinessAdminById,
  listActivity,
  listBusinessAdmins,
  updateBusinessAdmin,
  updateBusinessAdminPassword,
  updateBusinessAdminStatus,
} from './admin.service'
import {
  createBusinessAdminSchema,
  updateBusinessAdminPasswordSchema,
  updateBusinessAdminSchema,
  updateBusinessAdminStatusSchema,
} from './admin.schemas'

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

function parseId(value: string | string[] | undefined, message: string) {
  if (typeof value !== 'string') {
    const error = new Error(message)
    ;(error as any).status = 400
    throw error
  }

  const id = Number(value)

  if (Number.isNaN(id)) {
    const error = new Error(message)
    ;(error as any).status = 400
    throw error
  }

  return id
}

export async function getDashboardHandler(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const dashboard = await getAdminDashboard()

    res.status(200).json({
      ok: true,
      data: dashboard,
    })
  } catch (error) {
    next(error)
  }
}

export async function listActivityHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 30
    const activity = await listActivity(Number.isFinite(limit) ? limit : 30)

    res.status(200).json({
      ok: true,
      data: activity,
    })
  } catch (error) {
    next(error)
  }
}

export async function listBusinessAdminsHandler(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const admins = await listBusinessAdmins()

    res.status(200).json({
      ok: true,
      data: admins,
    })
  } catch (error) {
    next(error)
  }
}

export async function getBusinessAdminHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parseId(req.params.id, 'Selecciona un administrador válido.')
    const admin = await getBusinessAdminById(id)

    res.status(200).json({
      ok: true,
      data: admin,
    })
  } catch (error) {
    next(error)
  }
}

export async function createBusinessAdminHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req)
    const payload = createBusinessAdminSchema.parse(req.body)
    const admin = await createBusinessAdmin(payload, actor)

    res.status(201).json({
      ok: true,
      message: 'Administrador de negocio creado correctamente.',
      data: admin,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateBusinessAdminHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req)
    const id = parseId(req.params.id, 'Selecciona un administrador válido.')
    const payload = updateBusinessAdminSchema.parse(req.body)
    const admin = await updateBusinessAdmin(id, payload, actor)

    res.status(200).json({
      ok: true,
      message: 'Administrador de negocio actualizado correctamente.',
      data: admin,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateBusinessAdminStatusHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req)
    const id = parseId(req.params.id, 'Selecciona un administrador válido.')
    const payload = updateBusinessAdminStatusSchema.parse(req.body)
    const admin = await updateBusinessAdminStatus(id, payload.isActive, actor)

    res.status(200).json({
      ok: true,
      message: payload.isActive
        ? 'Administrador activado correctamente.'
        : 'Administrador desactivado correctamente.',
      data: admin,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateBusinessAdminPasswordHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req)
    const id = parseId(req.params.id, 'Selecciona un administrador válido.')
    const payload = updateBusinessAdminPasswordSchema.parse(req.body)
    const result = await updateBusinessAdminPassword(id, payload.password, actor)

    res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada correctamente.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteBusinessAdminHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const actor = getActor(req)
    const id = parseId(req.params.id, 'Selecciona un administrador válido.')
    const deleted = await deleteBusinessAdmin(id, actor)

    res.status(200).json({
      ok: true,
      message: 'Administrador eliminado o desvinculado correctamente.',
      data: deleted,
    })
  } catch (error) {
    next(error)
  }
}
