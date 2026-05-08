import { prisma } from '../../shared/db/prisma'
import {
  assertCanManageBusiness,
  BusinessActor,
} from '../../shared/authz/businessAccess'

function buildProductFallbackImage(name: string) {
  const label = encodeURIComponent(name || 'Producto')
  return `https://placehold.co/600x400?text=${label}`
}

function normalizeRequiredImageUrl(imageUrl: string | undefined) {
  const trimmed = imageUrl?.trim()

  if (!trimmed) {
    const error = new Error('Agrega una imagen para publicar el producto.')
    ;(error as any).status = 400
    throw error
  }

  return trimmed
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
          whatsapp: true,
          isActive: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          menuId: true,
        },
      },
    },
  })

  if (!product || !product.isActive) {
    const error = new Error('No encontramos el producto solicitado.')
    ;(error as any).status = 404
    throw error
  }

  return product
}

type CreateProductInput = {
  businessId: number
  categoryId: number
  name: string
  slug: string
  shortDescription?: string
  description?: string
  ingredients?: string
  price: number
  imageUrl?: string
  isFeatured?: boolean
  isActive?: boolean
  sortOrder?: number
}

export async function createProduct(
  input: CreateProductInput,
  actor: BusinessActor
) {
  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
  })

  if (!business) {
    const error = new Error('No encontramos el negocio seleccionado.')
    ;(error as any).status = 404
    throw error
  }

  await assertCanManageBusiness(prisma, input.businessId, actor)

  const category = await prisma.menuCategory.findUnique({
    where: { id: input.categoryId },
    include: {
      menu: true,
    },
  })

  if (!category) {
    const error = new Error('No encontramos la sección de carta seleccionada.')
    ;(error as any).status = 404
    throw error
  }

  if (category.menu.businessId !== input.businessId) {
    const error = new Error(
      'La sección seleccionada no pertenece a este negocio.'
    )
    ;(error as any).status = 400
    throw error
  }

  return prisma.product.create({
    data: {
      businessId: input.businessId,
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      shortDescription: input.shortDescription ?? null,
      description: input.description ?? null,
      ingredients: input.ingredients ?? null,
      price: input.price,
      imageUrl: normalizeRequiredImageUrl(input.imageUrl),
      isFeatured: input.isFeatured ?? false,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  })
}

type UpdateProductInput = {
  categoryId?: number
  name?: string
  slug?: string
  shortDescription?: string
  description?: string
  ingredients?: string
  price?: number
  imageUrl?: string
  isFeatured?: boolean
  isActive?: boolean
  sortOrder?: number
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
  actor: BusinessActor
) {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          menu: true,
        },
      },
    },
  })

  if (!existingProduct) {
      const error = new Error('No encontramos el producto solicitado.')
    ;(error as any).status = 404
    throw error
  }

  await assertCanManageBusiness(prisma, existingProduct.businessId, actor)

  if (input.categoryId !== undefined) {
    const category = await prisma.menuCategory.findUnique({
      where: { id: input.categoryId },
      include: {
        menu: true,
      },
    })

    if (!category) {
      const error = new Error('No encontramos la sección de carta seleccionada.')
      ;(error as any).status = 404
      throw error
    }

    if (category.menu.businessId !== existingProduct.businessId) {
      const error = new Error(
        'La sección seleccionada no pertenece al negocio del producto.'
      )
      ;(error as any).status = 400
      throw error
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      categoryId: input.categoryId ?? existingProduct.categoryId,
      name: input.name ?? existingProduct.name,
      slug: input.slug ?? existingProduct.slug,
      shortDescription:
        input.shortDescription !== undefined
          ? input.shortDescription
          : existingProduct.shortDescription,
      description:
        input.description !== undefined
          ? input.description
          : existingProduct.description,
      ingredients:
        input.ingredients !== undefined
          ? input.ingredients
          : existingProduct.ingredients,
      price: input.price ?? existingProduct.price,
      imageUrl:
        input.imageUrl !== undefined
          ? normalizeRequiredImageUrl(input.imageUrl)
          : existingProduct.imageUrl ||
            buildProductFallbackImage(existingProduct.name),
      isFeatured: input.isFeatured ?? existingProduct.isFeatured,
      isActive: input.isActive ?? existingProduct.isActive,
      sortOrder: input.sortOrder ?? existingProduct.sortOrder,
    },
  })
}

export async function deactivateProduct(id: number, actor: BusinessActor) {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  })

  if (!existingProduct) {
    const error = new Error('No encontramos el producto solicitado.')
    ;(error as any).status = 404
    throw error
  }

  await assertCanManageBusiness(prisma, existingProduct.businessId, actor)

  return prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  })
}
