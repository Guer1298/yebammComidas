import { prisma } from '../../shared/db/prisma'

export async function getBusinesses() {
  const businesses = await prisma.business.findMany({
    where: {
      isActive: true,
    },
    include: {
      mediaAssets: true,
      reviews: true,
      promotions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return businesses.map((business) => {
    const avgRating =
      business.reviews.length > 0
        ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
          business.reviews.length
        : 0

    const primaryMedia =
      business.mediaAssets.find((item) => item.isPrimary) ||
      business.mediaAssets[0] ||
      null

    return {
      id: business.id,
      name: business.name,
      category: business.category,
      description: business.description,
      city: business.city,
      address: business.address,
      phone: business.phone,
      whatsapp: business.whatsapp,
      isActive: business.isActive,
      cover: primaryMedia,
      ratingAverage: Number(avgRating.toFixed(1)),
      reviewsCount: business.reviews.length,
      activePromotionsCount: business.promotions.length,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    }
  })
}

export async function getBusinessById(id: number) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      menus: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
        include: {
          categories: {
            where: {
              isActive: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
            include: {
              products: {
                where: {
                  isActive: true,
                },
                orderBy: {
                  sortOrder: 'asc',
                },
              },
            },
          },
        },
      },
      products: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              menuId: true,
            },
          },
        },
      },
      mediaAssets: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      reviews: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      promotions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      posts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      faqs: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!business) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  const avgRating =
    business.reviews.length > 0
      ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
        business.reviews.length
      : 0

  return {
    ...business,
    ratingAverage: Number(avgRating.toFixed(1)),
    reviewsCount: business.reviews.length,
  }
}

type UpdateBusinessInput = {
  name?: string
  category?: string
  businessType?: string | null
  description?: string | null
  aboutArticle?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  foundedAt?: string | Date | null
  capacity?: number | null
  isActive?: boolean
}

export async function updateBusiness(id: number, input: UpdateBusinessInput) {
  const existingBusiness = await prisma.business.findUnique({
    where: { id },
  })

  if (!existingBusiness) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  return prisma.business.update({
    where: { id },
    data: {
      name: input.name ?? existingBusiness.name,
      category: input.category ?? existingBusiness.category,
      businessType:
        input.businessType !== undefined
          ? input.businessType
          : existingBusiness.businessType,
      description:
        input.description !== undefined
          ? input.description
          : existingBusiness.description,
      aboutArticle:
        input.aboutArticle !== undefined
          ? input.aboutArticle
          : existingBusiness.aboutArticle,
      city: input.city !== undefined ? input.city : existingBusiness.city,
      address:
        input.address !== undefined ? input.address : existingBusiness.address,
      phone: input.phone !== undefined ? input.phone : existingBusiness.phone,
      whatsapp:
        input.whatsapp !== undefined
          ? input.whatsapp
          : existingBusiness.whatsapp,
      email: input.email !== undefined ? input.email : existingBusiness.email,
      website:
        input.website !== undefined ? input.website : existingBusiness.website,
      instagram:
        input.instagram !== undefined
          ? input.instagram
          : existingBusiness.instagram,
      facebook:
        input.facebook !== undefined
          ? input.facebook
          : existingBusiness.facebook,
      tiktok: input.tiktok !== undefined ? input.tiktok : existingBusiness.tiktok,
      foundedAt:
        input.foundedAt !== undefined
          ? input.foundedAt
            ? new Date(input.foundedAt)
            : null
          : existingBusiness.foundedAt,
      capacity:
        input.capacity !== undefined ? input.capacity : existingBusiness.capacity,
      isActive:
        input.isActive !== undefined ? input.isActive : existingBusiness.isActive,
    },
  })
}
