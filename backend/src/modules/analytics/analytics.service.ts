import { prisma } from '../../shared/db/prisma'
import { EventType, Prisma } from '@prisma/client'

type TrackEventInput = {
  userId?: number | null
  eventType: EventType
  entityType?: string | null
  entityId?: number | null
  metadata?: Record<string, unknown> | null
}

export async function trackEvent(input: TrackEventInput) {
  return prisma.interactionEvent.create({
    data: {
      userId: input.userId ?? null,
      eventType: input.eventType,
      metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.DbNull,
    },
  })
}

export { EventType }
