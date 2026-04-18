import { NextFunction, Request, Response } from 'express'
import {
  createProduct,
  getProductById,
  updateProduct,
  deactivateProduct,
} from './products.service'

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
        message: 'ID de producto inválido',
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
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await createProduct(req.body)

    res.status(201).json({
      ok: true,
      message: 'Producto creado correctamente',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de producto inválido',
      })
    }

    const product = await updateProduct(id, req.body)

    res.status(200).json({
      ok: true,
      message: 'Producto actualizado correctamente',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export async function deactivateProductHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
      return res.status(400).json({
        ok: false,
        message: 'ID de producto inválido',
      })
    }

    const product = await deactivateProduct(id)

    res.status(200).json({
      ok: true,
      message: 'Producto desactivado correctamente',
      data: product,
    })
  } catch (error) {
    next(error)
  }
}