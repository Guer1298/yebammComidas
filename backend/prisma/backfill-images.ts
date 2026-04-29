import 'dotenv/config'
import { MediaType } from '@prisma/client'
import { prisma } from '../src/shared/db/prisma'

function buildBusinessFallbackImage(name: string) {
  return `https://placehold.co/800x600?text=${encodeURIComponent(
    name || 'Negocio'
  )}`
}

function buildProductFallbackImage(name: string) {
  return `https://placehold.co/600x400?text=${encodeURIComponent(
    name || 'Producto'
  )}`
}

async function main() {
  const businesses = await prisma.business.findMany({
    include: {
      mediaAssets: true,
    },
  })

  let businessesUpdated = 0

  for (const business of businesses) {
    const primaryMedia =
      business.mediaAssets.find((item) => item.isPrimary) ||
      business.mediaAssets[0] ||
      null

    if (primaryMedia) {
      if (!primaryMedia.isPrimary) {
        await prisma.mediaAsset.update({
          where: { id: primaryMedia.id },
          data: { isPrimary: true },
        })
      }
      continue
    }

    await prisma.mediaAsset.create({
      data: {
        businessId: business.id,
        type: MediaType.IMAGE,
        url: buildBusinessFallbackImage(business.name),
        thumbnailUrl: buildBusinessFallbackImage(business.name),
        altText: business.name,
        title: 'Portada principal',
        caption: 'Imagen principal del negocio',
        isPrimary: true,
        sortOrder: 1,
      },
    })

    businessesUpdated += 1
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [{ imageUrl: null }, { imageUrl: '' }],
    },
  })

  let productsUpdated = 0

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrl: buildProductFallbackImage(product.name),
      },
    })

    productsUpdated += 1
  }

  console.log('Backfill de imágenes completado.', {
    businessesWithoutCoverFilled: businessesUpdated,
    productsWithoutImageFilled: productsUpdated,
  })
}

main()
  .catch((error) => {
    console.error('Error ejecutando backfill de imágenes:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
