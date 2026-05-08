import { PromotionStatus } from '@prisma/client'
import { prisma } from '../../shared/db/prisma'
import {
  assertCanManageBusiness,
  BusinessActor,
} from '../../shared/authz/businessAccess'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function buildFallbackPromotionSlug(title: string) {
  const slug = slugify(title || 'promocion')
  return slug.length > 0 ? slug : 'promocion'
}

function fail(message: string, status = 400): never {
  const error = new Error(message)
  ;(error as any).status = status
  throw error
}

function normalizeRequiredImageUrl(imageUrl?: string | null) {
  const trimmed = imageUrl?.trim()

  if (!trimmed) {
    fail('Agrega una imagen para publicar la promoción.')
  }

  return trimmed
}

function normalizeOptionalLink(url?: string | null) {
  const trimmed = url?.trim()

  if (!trimmed) return null

  if (trimmed.startsWith('/')) return trimmed

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    // handled below
  }

  fail('El enlace del botón debe ser una URL válida o una ruta interna que empiece por /.')
}

function parseOptionalDate(value?: string | Date | null, fieldName?: string) {
  if (value === undefined || value === null || value === '') return null

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    fail(`La fecha ${fieldName ?? 'indicada'} no es válida`)
  }

  return date
}

function validateDateRange(startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && endsAt && startsAt > endsAt) {
    fail('La fecha de inicio no puede ser mayor que la fecha de fin')
  }
}

type PromotionQuery = {
  businessId?: number
  status?: PromotionStatus | 'ALL'
}

type CreatePromotionInput = {
  businessId: number
  title: string
  slug?: string
  description?: string | null
  imageUrl?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  startsAt?: string | Date | null
  endsAt?: string | Date | null
  status?: PromotionStatus
  isHighlighted?: boolean
}

type UpdatePromotionInput = Partial<CreatePromotionInput>

export async function listPromotions(query: PromotionQuery = {}) {
  const promotions = await prisma.promotion.findMany({
    where: {
      ...(query.businessId ? { businessId: query.businessId } : {}),
      ...(query.status && query.status !== 'ALL'
        ? { status: query.status }
        : { status: PromotionStatus.ACTIVE }),
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
        },
      },
    },
    orderBy: [
      { isHighlighted: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return promotions
}

export async function getPromotionById(id: number) {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
        },
      },
    },
  })

  if (!promotion) {
    const error = new Error('No encontramos la promoción solicitada.')
    ;(error as any).status = 404
    throw error
  }

  return promotion
}

export async function listPromotionsByBusinessId(businessId: number) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business || !business.isActive) {
    const error = new Error('No encontramos el negocio seleccionado.')
    ;(error as any).status = 404
    throw error
  }

  return listPromotions({ businessId, status: 'ALL' })
}

export async function createPromotion(
  input: CreatePromotionInput,
  actor: BusinessActor
) {
  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
  })

  if (!business || !business.isActive) {
    const error = new Error('No encontramos el negocio seleccionado.')
    ;(error as any).status = 404
    throw error
  }

  await assertCanManageBusiness(prisma, input.businessId, actor)

  const slug = input.slug?.trim() || buildFallbackPromotionSlug(input.title)
  const startsAt = parseOptionalDate(input.startsAt, 'de inicio')
  const endsAt = parseOptionalDate(input.endsAt, 'de fin')
  validateDateRange(startsAt, endsAt)

  return prisma.promotion.create({
    data: {
      businessId: input.businessId,
      title: input.title,
      slug,
      description: input.description ?? null,
      imageUrl: normalizeRequiredImageUrl(input.imageUrl),
      ctaLabel: input.ctaLabel ?? null,
      ctaUrl: normalizeOptionalLink(input.ctaUrl),
      startsAt,
      endsAt,
      status: input.status ?? PromotionStatus.DRAFT,
      isHighlighted: input.isHighlighted ?? false,
    },
  })
}

export async function updatePromotion(
  id: number,
  input: UpdatePromotionInput,
  actor: BusinessActor
) {
  const existingPromotion = await prisma.promotion.findUnique({
    where: { id },
  })

  if (!existingPromotion) {
    const error = new Error('No encontramos la promoción solicitada.')
    ;(error as any).status = 404
    throw error
  }

  await assertCanManageBusiness(prisma, existingPromotion.businessId, actor)

  const nextBusinessId = input.businessId ?? existingPromotion.businessId
  const startsAt =
    input.startsAt !== undefined
      ? parseOptionalDate(input.startsAt, 'de inicio')
      : existingPromotion.startsAt
  const endsAt =
    input.endsAt !== undefined
      ? parseOptionalDate(input.endsAt, 'de fin')
      : existingPromotion.endsAt

  validateDateRange(startsAt, endsAt)

  if (input.businessId !== undefined) {
    const business = await prisma.business.findUnique({
      where: { id: input.businessId },
    })

    if (!business || !business.isActive) {
      const error = new Error('No encontramos el negocio seleccionado.')
      ;(error as any).status = 404
      throw error
    }

    await assertCanManageBusiness(prisma, input.businessId, actor)
  }

  return prisma.promotion.update({
    where: { id },
    data: {
      businessId: nextBusinessId,
      title: input.title ?? existingPromotion.title,
      slug: input.slug?.trim()
        ? input.slug
        : input.title
        ? buildFallbackPromotionSlug(input.title)
        : existingPromotion.slug,
      description:
        input.description !== undefined
          ? input.description
          : existingPromotion.description,
      imageUrl: normalizeRequiredImageUrl(
        input.imageUrl !== undefined ? input.imageUrl : existingPromotion.imageUrl
      ),
      ctaLabel:
        input.ctaLabel !== undefined ? input.ctaLabel : existingPromotion.ctaLabel,
      ctaUrl: normalizeOptionalLink(
        input.ctaUrl !== undefined ? input.ctaUrl : existingPromotion.ctaUrl
      ),
      startsAt,
      endsAt,
      status: input.status ?? existingPromotion.status,
      isHighlighted:
        input.isHighlighted !== undefined
          ? input.isHighlighted
          : existingPromotion.isHighlighted,
    },
  })
}

export async function deactivatePromotion(id: number, actor: BusinessActor) {
  const existingPromotion = await prisma.promotion.findUnique({
    where: { id },
  })

  if (!existingPromotion) {
    const error = new Error('No encontramos la promoción solicitada.')
    ;(error as any).status = 404
    throw error
  }

  await assertCanManageBusiness(prisma, existingPromotion.businessId, actor)

  return prisma.promotion.update({
    where: { id },
    data: {
      status: PromotionStatus.ARCHIVED,
      isHighlighted: false,
    },
  })
}
