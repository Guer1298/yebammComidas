import { MediaType, Prisma } from '@prisma/client'
import { prisma } from '../../shared/db/prisma'
import { hashPassword } from '../../shared/utils/hash'
import {
  assertCanManageBusiness,
  BusinessActor,
} from '../../shared/authz/businessAccess'
import { createActivityLog } from '../../shared/activity/activityLog'

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
  providedSlug?: string | null,
  excludeBusinessId?: number
) {
  const baseSlug = slugify(providedSlug?.trim() || name || 'negocio') || 'negocio'
  let candidate = baseSlug
  let suffix = 2

  while (
    await tx.business.findFirst({
      where: {
        slug: candidate,
        ...(excludeBusinessId ? { id: { not: excludeBusinessId } } : {}),
      },
      select: { id: true },
    })
  ) {
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
      admins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      _count: {
        select: {
          products: true,
          reviews: true,
        },
      },
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
    slug?: string
    mediaAssets: Array<{
      id: number
      url: string
      isPrimary: boolean | null
      createdAt: Date
      updatedAt: Date
    }>
    admins?: Array<{
      id: number
      isPrimary: boolean
      user: {
        id: number
        name: string
        email: string
        isActive: boolean
      }
    }>
    _count?: {
      products: number
      reviews: number
    }
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
      slug: business.slug,
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
      productsCount: business._count?.products ?? 0,
      primaryAdmin:
        business.admins?.find((item) => item.isPrimary)?.user ||
        business.admins?.[0]?.user ||
        null,
      admins:
        business.admins?.map((item) => ({
          id: item.id,
          isPrimary: item.isPrimary,
          user: item.user,
        })) ?? [],
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    }
  })
}

type CreateBusinessInput = {
  name: string
  slug?: string | null
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
  profileImageUrl?: string | null
  isActive?: boolean
  adminName?: string | null
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
    const slug = await buildUniqueBusinessSlug(tx, name, input.slug)

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
        profileImageUrl: normalizeOptionalImageUrl(input.profileImageUrl),
        isActive: input.isActive ?? true,
      },
    })

    await tx.businessAdmin.create({
      data: {
        userId: input.creatorUserId,
        businessId: business.id,
        displayName: input.creatorDisplayName || 'Super administrador',
        title: 'Super administrador',
        isPrimary: false,
        isVisibleOnProfile: false,
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
        name: input.adminName?.trim() || `${name} Admin`,
        email: adminEmail,
        passwordHash,
        role: 'BUSINESS_ADMIN',
      },
    })

    await tx.businessAdmin.create({
      data: {
        userId: adminUser.id,
        businessId: business.id,
        displayName: input.adminName?.trim() || 'Administrador del negocio',
        title: 'Administrador principal',
        isPrimary: true,
        isVisibleOnProfile: true,
      },
    })

    await createActivityLog(
      {
        action: 'BUSINESS_CREATED',
        entity: 'Business',
        entityId: business.id,
        message: `Negocio "${business.name}" creado con administrador inicial ${adminEmail}.`,
        userId: input.creatorUserId,
      },
      tx
    )

    return business
  })

  return getBusinessById(createdBusiness.id)
}

export async function getBusinessById(id: number) {
  return getBusinessByIdWithUser(id)
}

export async function getBusinessByIdForAdmin(id: number) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      admins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      mediaAssets: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          products: true,
          reviews: true,
          promotions: true,
        },
      },
    },
  })

  if (!business) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  const { _count, admins, mediaAssets, reviews, likes, customers, followers, posts, faqs, menus, products, promotions, ...businessData } = business as any

  return {
    ...businessData,
    productsCount: _count.products,
    reviewsCount: _count.reviews,
    promotionsCount: _count.promotions,
    mediaAssets,
    admins: admins.map((item: any) => ({
      id: item.id,
      isPrimary: item.isPrimary,
      user: item.user,
    })),
    primaryAdmin:
      admins.find((item: any) => item.isPrimary)?.user || admins[0]?.user || null,
  }
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
      customers: {
        select: {
          userId: true,
        },
      },
      followers: {
        select: {
          userId: true,
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

  if (!business.isActive) {
    const error = new Error('Negocio no disponible')
    ;(error as any).status = 404
    throw error
  }

  const avgRating =
    business.reviews.length > 0
      ? business.reviews.reduce((acc: any, review: { rating: any }) => acc + review.rating, 0) /
        business.reviews.length
      : 0

  return {
    ...business,
    ratingAverage: Number(avgRating.toFixed(1)),
    reviewsCount: business.reviews.length,
    likesCount: business.likes.length,
    hasLiked: userId ? business.likes.some((like) => like.userId === userId) : false,
    customersCount: business.customers.length,
    isCustomer: userId ? business.customers.some((customer) => customer.userId === userId) : false,
    followersCount: business.followers.length,
    isFollowing: userId ? business.followers.some((follow) => follow.userId === userId) : false,
  }
}

type UpdateBusinessInput = {
  name?: string
  slug?: string
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
  primaryAdminUserId?: number | null
  confirmSlugChange?: boolean
}

export async function updateBusiness(
  id: number,
  input: UpdateBusinessInput,
  actor: BusinessActor
) {
  const existingBusiness = await prisma.business.findUnique({
    where: { id },
  })

  if (!existingBusiness) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  if (
    actor.role !== 'ADMIN' &&
    (input.isActive !== undefined ||
      input.isVerified !== undefined ||
      input.primaryAdminUserId !== undefined)
  ) {
    const error = new Error('No tienes permisos para modificar campos de plataforma')
    ;(error as any).status = 403
    throw error
  }

  return prisma.$transaction(async (tx) => {
    await assertCanManageBusiness(
      tx,
      id,
      actor,
      'No tienes permisos para actualizar este negocio'
    )

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

    const nextSlug =
      input.slug !== undefined
        ? await buildUniqueBusinessSlug(
            tx,
            input.name ?? existingBusiness.name,
            input.slug,
            id
          )
        : existingBusiness.slug

    if (
      input.slug !== undefined &&
      nextSlug !== existingBusiness.slug &&
      existingBusiness.isActive &&
      !input.confirmSlugChange
    ) {
      const error = new Error(
        'Cambiar el slug de un negocio activo puede romper URLs públicas. Confirma el cambio para continuar.'
      )
      ;(error as any).status = 400
      throw error
    }

    if (actor.role === 'ADMIN' && input.primaryAdminUserId !== undefined) {
      await tx.businessAdmin.updateMany({
        where: { businessId: id },
        data: { isPrimary: false },
      })

      if (input.primaryAdminUserId !== null) {
        const adminUser = await tx.user.findFirst({
          where: {
            id: input.primaryAdminUserId,
            role: 'BUSINESS_ADMIN',
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        })

        if (!adminUser) {
          const error = new Error('Administrador de negocio no encontrado')
          ;(error as any).status = 404
          throw error
        }

        if (!adminUser.isActive) {
          const error = new Error('No puedes asignar un administrador inactivo')
          ;(error as any).status = 400
          throw error
        }

        await tx.businessAdmin.upsert({
          where: {
            userId_businessId: {
              userId: adminUser.id,
              businessId: id,
            },
          },
          create: {
            userId: adminUser.id,
            businessId: id,
            displayName: adminUser.name,
            title: 'Administrador principal',
            isPrimary: true,
            isVisibleOnProfile: true,
          },
          update: {
            displayName: adminUser.name,
            isPrimary: true,
            isVisibleOnProfile: true,
          },
        })
      }
    }

    const updated = await tx.business.update({
      where: { id },
      data: {
        name: input.name ?? existingBusiness.name,
        slug: nextSlug,
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

    await createActivityLog(
      {
        action: 'BUSINESS_UPDATED',
        entity: 'Business',
        entityId: id,
        message: `Negocio "${updated.name}" actualizado.`,
        userId: actor.userId,
      },
      tx
    )

    return updated
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

    await assertCanManageBusiness(
      tx,
      businessId,
      actor,
      'No tienes permisos para actualizar este negocio'
    )

    await tx.business.update({
      where: { id: businessId },
      data: {
        profileImageUrl: normalizedUrl,
      },
    })
  })

  return getBusinessByIdWithUser(businessId, actor.userId)
}

export async function updateBusinessStatus(
  id: number,
  isActive: boolean,
  actor: BusinessActor
) {
  if (actor.role !== 'ADMIN') {
    const error = new Error('Solo un administrador general puede cambiar el estado')
    ;(error as any).status = 403
    throw error
  }

  return prisma.$transaction(async (tx) => {
    const existingBusiness = await tx.business.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    })

    if (!existingBusiness) {
      const error = new Error('Negocio no encontrado')
      ;(error as any).status = 404
      throw error
    }

    const business = await tx.business.update({
      where: { id },
      data: { isActive },
    })

    await createActivityLog(
      {
        action: isActive ? 'BUSINESS_ACTIVATED' : 'BUSINESS_DEACTIVATED',
        entity: 'Business',
        entityId: id,
        message: `Negocio "${existingBusiness.name}" ${
          isActive ? 'activado' : 'desactivado'
        }.`,
        userId: actor.userId,
      },
      tx
    )

    return business
  })
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

export async function toggleBusinessFollow(businessId: number, userId: number) {
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

    const existingFollow = await tx.followRelation.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    })

    if (existingFollow) {
      await tx.followRelation.delete({
        where: { id: existingFollow.id },
      })
    } else {
      await tx.followRelation.create({
        data: {
          userId,
          businessId,
        },
      })
    }

    const followersCount = await tx.followRelation.count({
      where: {
        businessId,
      },
    })

    return {
      isFollowing: !existingFollow,
      followersCount,
    }
  })
}

export async function toggleBusinessCustomer(businessId: number, userId: number) {
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

    const existingCustomer = await tx.businessCustomer.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    })

    if (existingCustomer) {
      await tx.businessCustomer.delete({
        where: { id: existingCustomer.id },
      })
    } else {
      await tx.businessCustomer.create({
        data: {
          userId,
          businessId,
        },
      })
    }

    const customersCount = await tx.businessCustomer.count({
      where: {
        businessId,
      },
    })

    return {
      isCustomer: !existingCustomer,
      customersCount,
    }
  })
}

export async function getBusinessCustomers(businessId: number, limit: number = 10, page: number = 1) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, isActive: true },
  })

  if (!business) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  if (!business.isActive) {
    const error = new Error('Negocio no disponible')
    ;(error as any).status = 404
    throw error
  }

  const offset = (page - 1) * limit

  const [customers, total] = await Promise.all([
    prisma.businessCustomer.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: false, // No exponer email
            passwordHash: false, // No exponer
            role: false, // No exponer
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.businessCustomer.count({
      where: { businessId },
    }),
  ])

  const items = customers.map((customer) => ({
    id: customer.user.id,
    name: customer.user.name,
    username: null, // Campo no disponible en el modelo User actual
    avatarUrl: null, // Campo no disponible en el modelo User actual
    createdAt: customer.createdAt.toISOString(),
  }))

  return {
    items,
    total,
    page,
    limit,
  }
}

export async function getBusinessFollowers(businessId: number, limit: number = 10, page: number = 1) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, isActive: true },
  })

  if (!business) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  if (!business.isActive) {
    const error = new Error('Negocio no disponible')
    ;(error as any).status = 404
    throw error
  }

  const offset = (page - 1) * limit

  const [followers, total] = await Promise.all([
    prisma.followRelation.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: false, // No exponer
            passwordHash: false, // No exponer
            role: false, // No exponer
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.followRelation.count({
      where: { businessId },
    }),
  ])

  const items = followers.map((follow) => ({
    id: follow.user.id,
    name: follow.user.name,
    username: null, // Campo no disponible en el modelo User actual
    avatarUrl: null, // Campo no disponible en el modelo User actual
    createdAt: follow.createdAt.toISOString(),
  }))

  return {
    items,
    total,
    page,
    limit,
  }
}

export async function deleteBusiness(id: number, actor: BusinessActor) {
  if (actor.role !== 'ADMIN') {
    const error = new Error('Solo un administrador general puede eliminar negocios')
    ;(error as any).status = 403
    throw error
  }

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

  await prisma.$transaction(async (tx) => {
    await createActivityLog(
      {
        action: 'BUSINESS_DELETED',
        entity: 'Business',
        entityId: existingBusiness.id,
        message: `Negocio "${existingBusiness.name}" eliminado definitivamente.`,
        userId: actor.userId,
      },
      tx
    )

    await tx.business.delete({
      where: { id },
    })
  })

  return existingBusiness
}
