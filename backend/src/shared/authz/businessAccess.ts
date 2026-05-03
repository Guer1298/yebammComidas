import { Prisma } from '@prisma/client'
import { prisma } from '../db/prisma'

export type BusinessActor = {
  userId: number
  role: string
}

type PrismaClientLike = Prisma.TransactionClient | typeof prisma

export async function canManageBusiness(
  tx: PrismaClientLike,
  businessId: number,
  actor: BusinessActor
) {
  if (actor.role === 'ADMIN') return true
  if (actor.role !== 'BUSINESS_ADMIN') return false

  const relation = await tx.businessAdmin.findFirst({
    where: {
      businessId,
      userId: actor.userId,
      canEditBusiness: true,
    },
    select: { id: true },
  })

  return Boolean(relation)
}

export async function assertCanManageBusiness(
  tx: PrismaClientLike,
  businessId: number,
  actor: BusinessActor,
  message = 'No tienes permisos para administrar este negocio'
) {
  const allowed = await canManageBusiness(tx, businessId, actor)

  if (!allowed) {
    const error = new Error(message)
    ;(error as any).status = 403
    throw error
  }
}
