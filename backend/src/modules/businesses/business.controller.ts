import { NextFunction, Request, Response } from 'express'
import { getBusinessById, getBusinesses, updateBusiness } from './business.service'

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

    const business = await getBusinessById(id)

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
