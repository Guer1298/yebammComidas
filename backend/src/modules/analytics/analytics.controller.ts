import { NextFunction, Request, Response } from 'express'
import { trackEvent, EventType } from './analytics.service'

export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, eventType, entityType, entityId, metadata } = req.body

    if (!eventType || typeof eventType !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'eventType es obligatorio',
      })
    }

    if (!Object.values(EventType).includes(eventType as EventType)) {
      return res.status(400).json({
        ok: false,
        message: 'eventType no es válido',
      })
    }

    const event = await trackEvent({
      userId,
      eventType: eventType as EventType,
      entityType,
      entityId,
      metadata,
    })

    res.status(201).json({
      ok: true,
      message: 'Evento registrado correctamente',
      data: event,
    })
  } catch (error) {
    next(error)
  }
}