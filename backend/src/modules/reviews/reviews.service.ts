import { prisma } from '../../shared/db/prisma'

export async function getReviewsByBusinessId(businessId: number) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business || !business.isActive) {
    const error = new Error('No encontramos el negocio solicitado.')
    ;(error as any).status = 404
    throw error
  }

  const reviews = await prisma.review.findMany({
    where: {
      businessId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const ratingAverage =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0

  return {
    businessId,
    ratingAverage: Number(ratingAverage.toFixed(1)),
    reviewsCount: reviews.length,
    reviews,
  }
}

type CreateReviewInput = {
  businessId: number
  userId: number
  rating: number
  comment?: string
}

export async function createReview(input: CreateReviewInput) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  })

  if (!user || !user.isActive || user.deletedAt) {
    const error = new Error('Inicia sesión para publicar una reseña.')
    ;(error as any).status = 401
    throw error
  }

  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
  })

  if (!business || !business.isActive) {
    const error = new Error('No encontramos el negocio solicitado.')
    ;(error as any).status = 404
    throw error
  }

  if (input.rating < 1 || input.rating > 5) {
    const error = new Error('La calificación debe estar entre 1 y 5.')
    ;(error as any).status = 400
    throw error
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      businessId: input.businessId,
      userId: input.userId,
    },
  })

  if (existingReview) {
    const error = new Error('Ya publicaste una reseña para este negocio.')
    ;(error as any).status = 409
    throw error
  }

  return prisma.review.create({
    data: {
      businessId: input.businessId,
      userId: input.userId,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}
