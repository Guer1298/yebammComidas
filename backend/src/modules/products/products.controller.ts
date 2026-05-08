import { NextFunction, Request, Response } from 'express'
import {
  createProduct,
  getProductById,
  updateProduct,
  deactivateProduct,
} from './products.service'
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

export async function findProductById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona un producto válido.',
      })
    }

    const product = await getProductById(id)

    res.status(200).json({
      ok: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export async function createProductHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await createProduct(req.body, getActor(req))

    res.status(201).json({
      ok: true,
      message: 'Producto creado correctamente.',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProductHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona un producto válido.',
      })
    }

    const product = await updateProduct(id, req.body, getActor(req))

    res.status(200).json({
      ok: true,
      message: 'Producto actualizado correctamente.',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export async function deactivateProductHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'Selecciona un producto válido.',
      })
    }

    const product = await deactivateProduct(id, getActor(req))

    res.status(200).json({
      ok: true,
      message: 'Producto desactivado correctamente.',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}
