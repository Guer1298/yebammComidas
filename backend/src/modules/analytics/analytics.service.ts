import { prisma } from '../../shared/db/prisma'
import { EventType, Prisma } from '@prisma/client'

type TrackEventInput = {
  userId?: number | null
  eventType: EventType
  entityType?: string | null
  entityId?: number | null
  sourceScreen?: string | null
  sessionId?: string | null
  metadata?: Record<string, unknown> | null
}

export async function trackEvent(input: TrackEventInput) {
  return prisma.interactionEvent.create({
    data: {
      userId: input.userId ?? null,
      businessId:
        input.entityType === 'business' ? input.entityId ?? null : null,
      productId:
        input.entityType === 'product' ? input.entityId ?? null : null,
      eventType: input.eventType,
      sourceScreen: input.sourceScreen ?? null,
      sessionId: input.sessionId ?? null,
      metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
    },
  })
}

export { EventType }
