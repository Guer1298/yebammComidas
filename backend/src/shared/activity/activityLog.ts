import { Prisma } from '@prisma/client'
import { prisma } from '../db/prisma'

type PrismaClientLike = Prisma.TransactionClient | typeof prisma

export type ActivityLogInput = {
  action: string
  entity: string
  entityId?: number | null
  message: string
  userId?: number | null
}

export async function createActivityLog(
  input: ActivityLogInput,
  tx: PrismaClientLike = prisma
) {
  return (tx as any).activityLog.create({
    data: {
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      message: input.message,
      userId: input.userId ?? null,
    },
  })
}
