import { PromotionStatus } from '@prisma/client'
import { prisma } from '../../shared/db/prisma'

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
    const error = new Error('Promoción no encontrada')
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
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  return listPromotions({ businessId, status: 'ALL' })
}

export async function createPromotion(input: CreatePromotionInput) {
  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
  })

  if (!business || !business.isActive) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  const slug = input.slug?.trim() || buildFallbackPromotionSlug(input.title)

  return prisma.promotion.create({
    data: {
      businessId: input.businessId,
      title: input.title,
      slug,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      ctaLabel: input.ctaLabel ?? null,
      ctaUrl: input.ctaUrl ?? null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      status: input.status ?? PromotionStatus.DRAFT,
      isHighlighted: input.isHighlighted ?? false,
    },
  })
}

export async function updatePromotion(id: number, input: UpdatePromotionInput) {
  const existingPromotion = await prisma.promotion.findUnique({
    where: { id },
  })

  if (!existingPromotion) {
    const error = new Error('Promoción no encontrada')
    ;(error as any).status = 404
    throw error
  }

  const nextBusinessId = input.businessId ?? existingPromotion.businessId

  if (input.businessId !== undefined) {
    const business = await prisma.business.findUnique({
      where: { id: input.businessId },
    })

    if (!business || !business.isActive) {
      const error = new Error('Negocio no encontrado')
      ;(error as any).status = 404
      throw error
    }
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
      imageUrl:
        input.imageUrl !== undefined ? input.imageUrl : existingPromotion.imageUrl,
      ctaLabel:
        input.ctaLabel !== undefined ? input.ctaLabel : existingPromotion.ctaLabel,
      ctaUrl: input.ctaUrl !== undefined ? input.ctaUrl : existingPromotion.ctaUrl,
      startsAt:
        input.startsAt !== undefined
          ? input.startsAt
            ? new Date(input.startsAt)
            : null
          : existingPromotion.startsAt,
      endsAt:
        input.endsAt !== undefined
          ? input.endsAt
            ? new Date(input.endsAt)
            : null
          : existingPromotion.endsAt,
      status: input.status ?? existingPromotion.status,
      isHighlighted:
        input.isHighlighted !== undefined
          ? input.isHighlighted
          : existingPromotion.isHighlighted,
    },
  })
}

export async function deactivatePromotion(id: number) {
  const existingPromotion = await prisma.promotion.findUnique({
    where: { id },
  })

  if (!existingPromotion) {
    const error = new Error('Promoción no encontrada')
    ;(error as any).status = 404
    throw error
  }

  return prisma.promotion.update({
    where: { id },
    data: {
      status: PromotionStatus.ARCHIVED,
      isHighlighted: false,
    },
  })
}
