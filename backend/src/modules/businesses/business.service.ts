import { MediaType, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prisma'
import { hashPassword } from '../../shared/utils/hash'

function buildBusinessFallbackImage(name: string) {
  const label = encodeURIComponent(name || 'Negocio')
  return `https://placehold.co/800x600?text=${label}`
}

function normalizeImageUrl(imageUrl?: string | null) {
  const trimmed = imageUrl?.trim()

  if (!trimmed) {
    const error = new Error('La portada del negocio es obligatoria')
    ;(error as any).status = 400
    throw error
  }

  return trimmed
}

function normalizeOptionalImageUrl(imageUrl?: string | null) {
  const trimmed = imageUrl?.trim()
  return trimmed || null
}

type BusinessActor = {
  userId: number
  role: string
}

async function canManageBusiness(
  tx: Prisma.TransactionClient | typeof prisma,
  businessId: number,
  actor: BusinessActor
) {
  if (actor.role === 'ADMIN') {
    return true
  }

  if (actor.role !== 'BUSINESS_ADMIN') {
    return false
  }

  const relation = await tx.businessAdmin.findFirst({
    where: {
      businessId,
      userId: actor.userId,
      canEditBusiness: true,
    },
    select: {
      id: true,
    },
  })

  return Boolean(relation)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function buildUniqueBusinessSlug(
  tx: Prisma.TransactionClient,
  name: string,
  providedSlug?: string | null
) {
  const baseSlug = slugify(providedSlug?.trim() || name || 'negocio') || 'negocio'
  let candidate = baseSlug
  let suffix = 2

  while (await tx.business.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return candidate
}

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

  return mapBusinessListItems(businesses)
}

export async function getBusinessesForAdmin() {
  const businesses = await prisma.business.findMany({
    include: {
      mediaAssets: true,
      reviews: true,
      promotions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return mapBusinessListItems(businesses)
}

function mapBusinessListItems(
  businesses: Array<{
    id: number
    name: string
    category: string
    description: string | null
    city: string | null
    address: string | null
    phone: string | null
    whatsapp: string | null
    isActive: boolean
    profileImageUrl: string | null
    isVerified: boolean
    mediaAssets: Array<{
      id: number
      url: string
      isPrimary: boolean | null
      createdAt: Date
      updatedAt: Date
    }>
    reviews: Array<{
      rating: number
    }>
    promotions: Array<{
      id: number
    }>
    createdAt: Date
    updatedAt: Date
  }>
) {
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
      profileImageUrl: business.profileImageUrl,
      isVerified: business.isVerified,
      cover: primaryMedia,
      ratingAverage: Number(avgRating.toFixed(1)),
      reviewsCount: business.reviews.length,
      activePromotionsCount: business.promotions.length,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    }
  })
}

type CreateBusinessInput = {
  name: string
  category: string
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
  coverImageUrl?: string | null
  adminEmail?: string | null
  adminPassword?: string | null
  creatorUserId: number
  creatorDisplayName?: string | null
}

export async function createBusiness(input: CreateBusinessInput) {
  const name = input.name?.trim()
  const category = input.category?.trim()

  if (!name) {
    const error = new Error('El nombre del negocio es obligatorio')
    ;(error as any).status = 400
    throw error
  }

  if (!category) {
    const error = new Error('La categoría del negocio es obligatoria')
    ;(error as any).status = 400
    throw error
  }

  const coverImageUrl = normalizeImageUrl(input.coverImageUrl)

  const createdBusiness = await prisma.$transaction(async (tx) => {
    const slug = await buildUniqueBusinessSlug(tx, name)

    const business = await tx.business.create({
      data: {
        name,
        slug,
        category,
        businessType: input.businessType ?? null,
        description: input.description ?? null,
        aboutArticle: input.aboutArticle ?? null,
        city: input.city ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        instagram: input.instagram ?? null,
        facebook: input.facebook ?? null,
        tiktok: input.tiktok ?? null,
        isActive: true,
      },
    })

    await tx.businessAdmin.create({
      data: {
        userId: input.creatorUserId,
        businessId: business.id,
        displayName: input.creatorDisplayName || 'Super administrador',
        title: 'Super administrador',
        isPrimary: true,
        isVisibleOnProfile: true,
      },
    })

    const menu = await tx.menu.create({
      data: {
        businessId: business.id,
        name: 'Menú principal',
        description: 'Menú principal del negocio',
        isActive: true,
        sortOrder: 1,
      },
    })

    await tx.menuCategory.create({
      data: {
        menuId: menu.id,
        name: 'General',
        description: 'Categoría inicial para comenzar a publicar productos',
        isActive: true,
        sortOrder: 1,
      },
    })

    await tx.mediaAsset.create({
      data: {
        businessId: business.id,
        type: MediaType.IMAGE,
        url: coverImageUrl,
        thumbnailUrl: coverImageUrl,
        altText: name,
        title: 'Portada principal',
        caption: 'Imagen principal del negocio',
        isPrimary: true,
        sortOrder: 1,
      },
    })

    const adminEmail = input.adminEmail?.trim().toLowerCase()
    const adminPassword = input.adminPassword?.trim()

    if (!adminEmail || !adminPassword) {
      const error = new Error('Las credenciales de acceso inicial son obligatorias')
      ;(error as any).status = 400
      throw error
    }

    const existingAdmin = await tx.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      const error = new Error('El correo de acceso inicial ya está registrado')
      ;(error as any).status = 409
      throw error
    }

    const passwordHash = await hashPassword(adminPassword)

    const adminUser = await tx.user.create({
      data: {
        name: `${name} Admin`,
        email: adminEmail,
        passwordHash,
        role: 'BUSINESS_ADMIN',
      },
    })

    await tx.businessAdmin.create({
      data: {
        userId: adminUser.id,
        businessId: business.id,
        displayName: input.creatorDisplayName || 'Administrador del negocio',
        title: 'Administrador principal',
        isPrimary: true,
        isVisibleOnProfile: true,
      },
    })

    return business
  })

  return getBusinessById(createdBusiness.id)
}

export async function getBusinessById(id: number) {
  return getBusinessByIdWithUser(id)
}

export async function getBusinessByIdWithUser(id: number, userId?: number) {
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
      likes: {
        select: {
          userId: true,
        },
      },
      followers: {
        select: {
          id: true,
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
    likesCount: business.likes.length,
    hasLiked: userId ? business.likes.some((like) => like.userId === userId) : false,
    followersCount: business.followers.length,
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
  coverImageUrl?: string | null
  profileImageUrl?: string | null
  isVerified?: boolean
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

  return prisma.$transaction(async (tx) => {
    const mediaAssets = await tx.mediaAsset.findMany({
      where: { businessId: id },
      orderBy: { createdAt: 'desc' },
    })

    const primaryMedia =
      input.coverImageUrl?.trim()
        ? mediaAssets.find((item) => item.url === input.coverImageUrl?.trim()) ||
          mediaAssets.find((item) => item.isPrimary) ||
          null
        : mediaAssets.find((item) => item.isPrimary) || mediaAssets[0] || null

    if (!primaryMedia && !input.coverImageUrl?.trim()) {
      const error = new Error('La portada del negocio es obligatoria')
      ;(error as any).status = 400
      throw error
    }

    const nextCoverImageUrl = input.coverImageUrl
      ? normalizeImageUrl(input.coverImageUrl)
      : primaryMedia?.url || buildBusinessFallbackImage(existingBusiness.name)

    if (input.coverImageUrl?.trim()) {
      await tx.mediaAsset.updateMany({
        where: { businessId: id },
        data: {
          isPrimary: false,
        },
      })
    }

    if (primaryMedia) {
      await tx.mediaAsset.update({
        where: { id: primaryMedia.id },
        data: {
          url: nextCoverImageUrl,
          thumbnailUrl: nextCoverImageUrl,
          type: MediaType.IMAGE,
          isPrimary: true,
        },
      })
    } else {
      await tx.mediaAsset.create({
        data: {
          businessId: id,
          type: MediaType.IMAGE,
          url: nextCoverImageUrl,
          thumbnailUrl: nextCoverImageUrl,
          altText: existingBusiness.name,
          title: 'Portada principal',
          caption: 'Imagen principal del negocio',
          isPrimary: true,
          sortOrder: 1,
        },
      })
    }

    return tx.business.update({
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
        tiktok:
          input.tiktok !== undefined ? input.tiktok : existingBusiness.tiktok,
        profileImageUrl:
          input.profileImageUrl !== undefined
            ? normalizeOptionalImageUrl(input.profileImageUrl)
            : existingBusiness.profileImageUrl,
        isVerified:
          input.isVerified !== undefined
            ? input.isVerified
            : existingBusiness.isVerified,
        foundedAt:
          input.foundedAt !== undefined
            ? input.foundedAt
              ? new Date(input.foundedAt)
              : null
            : existingBusiness.foundedAt,
        capacity:
          input.capacity !== undefined
            ? input.capacity
            : existingBusiness.capacity,
        isActive:
          input.isActive !== undefined ? input.isActive : existingBusiness.isActive,
      },
    })
  })
}

type UpdateBusinessProfileImageInput = {
  businessId: number
  profileImageUrl: string
  actor: BusinessActor
}

export async function updateBusinessProfileImage({
  businessId,
  profileImageUrl,
  actor,
}: UpdateBusinessProfileImageInput) {
  const normalizedUrl = normalizeImageUrl(profileImageUrl)

  return prisma.$transaction(async (tx) => {
    const business = await tx.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
      },
    })

    if (!business) {
      const error = new Error('Negocio no encontrado')
      ;(error as any).status = 404
      throw error
    }

    const allowed = await canManageBusiness(tx, businessId, actor)

    if (!allowed) {
      const error = new Error('No tienes permisos para actualizar este negocio')
      ;(error as any).status = 403
      throw error
    }

    await tx.business.update({
      where: { id: businessId },
      data: {
        profileImageUrl: normalizedUrl,
      },
    })
  })

  return getBusinessByIdWithUser(businessId, actor.userId)
}

export async function toggleBusinessLike(businessId: number, userId: number) {
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
      },
    })

    if (!business) {
      const error = new Error('Negocio no encontrado')
      ;(error as any).status = 404
      throw error
    }

    const existingLike = await tx.businessLike.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    })

    if (existingLike) {
      await tx.businessLike.delete({
        where: { id: existingLike.id },
      })
    } else {
      await tx.businessLike.create({
        data: {
          userId,
          businessId,
        },
      })
    }

    const likesCount = await tx.businessLike.count({
      where: {
        businessId,
      },
    })

    return {
      hasLiked: !existingLike,
      likesCount,
    }
  })
}

export async function deleteBusiness(id: number) {
  const existingBusiness = await prisma.business.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!existingBusiness) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  await prisma.business.delete({
    where: { id },
  })

  return existingBusiness
}
