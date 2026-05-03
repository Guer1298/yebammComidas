import { Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prisma'
import { hashPassword } from '../../shared/utils/hash'
import { createActivityLog } from '../../shared/activity/activityLog'

type AdminActor = {
  userId: number
  role: string
}

type CreateBusinessAdminInput = {
  name: string
  email: string
  password: string
  isActive?: boolean
  businessIds?: number[]
  businessId?: number | null
}

type UpdateBusinessAdminInput = {
  name?: string
  email?: string
  isActive?: boolean
  businessIds?: number[]
  businessId?: number | null
}

function assertPlatformAdmin(actor: AdminActor) {
  if (actor.role !== 'ADMIN') {
    const error = new Error('Solo un administrador general puede realizar esta acción')
    ;(error as any).status = 403
    throw error
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeBusinessIds(input: Pick<CreateBusinessAdminInput, 'businessId' | 'businessIds'>) {
  if (input.businessIds !== undefined) {
    return Array.from(new Set(input.businessIds))
  }

  if (input.businessId === undefined) return undefined
  if (input.businessId === null) return []

  return [input.businessId]
}

async function assertBusinessesExist(businessIds: number[]) {
  if (businessIds.length === 0) return

  const count = await prisma.business.count({
    where: {
      id: { in: businessIds },
      deletedAt: null,
    },
  })

  if (count !== businessIds.length) {
    const error = new Error('Uno o más negocios asignados no existen')
    ;(error as any).status = 400
    throw error
  }
}

const businessAdminSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  businessAdmins: {
    select: {
      id: true,
      businessId: true,
      isPrimary: true,
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          isActive: true,
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  },
}

function mapBusinessAdmin(user: any) {
  const businesses = user.businessAdmins.map((relation: any) => ({
    relationId: relation.id,
    isPrimary: relation.isPrimary,
    ...relation.business,
  }))

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    businessIds: businesses.map((business: any) => business.id),
    businesses,
    primaryBusiness: businesses[0] ?? null,
  }
}

export async function getAdminDashboard() {
  const [
    totalBusinesses,
    activeBusinesses,
    inactiveBusinesses,
    totalBusinessAdmins,
    totalProducts,
    totalReviews,
    recentActivity,
  ] = await Promise.all([
    prisma.business.count({ where: { deletedAt: null } }),
    prisma.business.count({ where: { isActive: true, deletedAt: null } }),
    prisma.business.count({ where: { isActive: false, deletedAt: null } }),
    prisma.user.count({ where: { role: 'BUSINESS_ADMIN', deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.review.count(),
    listActivity(8),
  ])

  return {
    totalBusinesses,
    activeBusinesses,
    inactiveBusinesses,
    totalBusinessAdmins,
    totalProducts,
    totalReviews,
    recentActivity,
  }
}

export async function listActivity(limit = 30) {
  const activity = await (prisma as any).activityLog.findMany({
    take: Math.min(Math.max(limit, 1), 100),
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return activity
}

export async function listBusinessAdmins() {
  const users = await prisma.user.findMany({
    where: {
      role: 'BUSINESS_ADMIN',
      deletedAt: null,
    },
    select: businessAdminSelect,
    orderBy: { createdAt: 'desc' },
  })

  return users.map(mapBusinessAdmin)
}

export async function getBusinessAdminById(id: number) {
  const user = await prisma.user.findFirst({
    where: {
      id,
      role: 'BUSINESS_ADMIN',
      deletedAt: null,
    },
    select: businessAdminSelect,
  })

  if (!user) {
    const error = new Error('Administrador de negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  return mapBusinessAdmin(user)
}

export async function createBusinessAdmin(
  input: CreateBusinessAdminInput,
  actor: AdminActor
) {
  assertPlatformAdmin(actor)

  const email = normalizeEmail(input.email)
  const businessIds = normalizeBusinessIds(input) ?? []
  await assertBusinessesExist(businessIds)

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    const error = new Error('El correo ya está registrado')
    ;(error as any).status = 409
    throw error
  }

  const passwordHash = await hashPassword(input.password)

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
        role: 'BUSINESS_ADMIN',
        isActive: input.isActive ?? true,
      },
    })

    if (businessIds.length > 0) {
      await tx.businessAdmin.createMany({
        data: businessIds.map((businessId) => ({
          userId: user.id,
          businessId,
          displayName: user.name,
          title: 'Administrador',
          isPrimary: false,
          isVisibleOnProfile: true,
        })),
        skipDuplicates: true,
      })
    }

    await createActivityLog(
      {
        action: 'BUSINESS_ADMIN_CREATED',
        entity: 'User',
        entityId: user.id,
        message: `Administrador de negocio "${user.email}" creado.`,
        userId: actor.userId,
      },
      tx
    )

    return user
  })

  return getBusinessAdminById(createdUser.id)
}

export async function updateBusinessAdmin(
  id: number,
  input: UpdateBusinessAdminInput,
  actor: AdminActor
) {
  assertPlatformAdmin(actor)

  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      role: 'BUSINESS_ADMIN',
      deletedAt: null,
    },
  })

  if (!existingUser) {
    const error = new Error('Administrador de negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  const email = input.email ? normalizeEmail(input.email) : existingUser.email
  const businessIds = normalizeBusinessIds(input)

  if (email !== existingUser.email) {
    const emailInUse = await prisma.user.findUnique({ where: { email } })

    if (emailInUse && emailInUse.id !== id) {
      const error = new Error('El correo ya está registrado')
      ;(error as any).status = 409
      throw error
    }
  }

  if (businessIds !== undefined) {
    await assertBusinessesExist(businessIds)
  }

  await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        name: input.name?.trim() ?? existingUser.name,
        email,
        isActive: input.isActive ?? existingUser.isActive,
      },
    })

    if (businessIds !== undefined) {
      await tx.businessAdmin.deleteMany({ where: { userId: id } })

      if (businessIds.length > 0) {
        await tx.businessAdmin.createMany({
          data: businessIds.map((businessId) => ({
            userId: id,
            businessId,
            displayName: updatedUser.name,
            title: 'Administrador',
            isPrimary: false,
            isVisibleOnProfile: true,
          })),
          skipDuplicates: true,
        })
      }
    }

    await createActivityLog(
      {
        action: 'BUSINESS_ADMIN_UPDATED',
        entity: 'User',
        entityId: id,
        message: `Administrador de negocio "${updatedUser.email}" actualizado.`,
        userId: actor.userId,
      },
      tx
    )
  })

  return getBusinessAdminById(id)
}

export async function updateBusinessAdminStatus(
  id: number,
  isActive: boolean,
  actor: AdminActor
) {
  assertPlatformAdmin(actor)

  const user = await prisma.user.findFirst({
    where: {
      id,
      role: 'BUSINESS_ADMIN',
      deletedAt: null,
    },
  })

  if (!user) {
    const error = new Error('Administrador de negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { isActive },
    })

    await createActivityLog(
      {
        action: isActive
          ? 'BUSINESS_ADMIN_ACTIVATED'
          : 'BUSINESS_ADMIN_DEACTIVATED',
        entity: 'User',
        entityId: id,
        message: `Administrador de negocio "${user.email}" ${
          isActive ? 'activado' : 'desactivado'
        }.`,
        userId: actor.userId,
      },
      tx
    )
  })

  return getBusinessAdminById(id)
}

export async function updateBusinessAdminPassword(
  id: number,
  password: string,
  actor: AdminActor
) {
  assertPlatformAdmin(actor)

  const user = await prisma.user.findFirst({
    where: {
      id,
      role: 'BUSINESS_ADMIN',
      deletedAt: null,
    },
  })

  if (!user) {
    const error = new Error('Administrador de negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  const passwordHash = await hashPassword(password)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { passwordHash },
    })

    await createActivityLog(
      {
        action: 'BUSINESS_ADMIN_PASSWORD_RESET',
        entity: 'User',
        entityId: id,
        message: `Contraseña del administrador "${user.email}" actualizada.`,
        userId: actor.userId,
      },
      tx
    )
  })

  return { id }
}

export async function deleteBusinessAdmin(id: number, actor: AdminActor) {
  assertPlatformAdmin(actor)

  const user = await prisma.user.findFirst({
    where: {
      id,
      role: 'BUSINESS_ADMIN',
      deletedAt: null,
    },
  })

  if (!user) {
    const error = new Error('Administrador de negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  await prisma.$transaction(async (tx) => {
    await tx.businessAdmin.deleteMany({ where: { userId: id } })
    await tx.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    })

    await createActivityLog(
      {
        action: 'BUSINESS_ADMIN_DELETED',
        entity: 'User',
        entityId: id,
        message: `Administrador de negocio "${user.email}" eliminado/desvinculado.`,
        userId: actor.userId,
      },
      tx
    )
  })

  return { id, email: user.email, name: user.name }
}
