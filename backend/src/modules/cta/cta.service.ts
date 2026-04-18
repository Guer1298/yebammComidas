import { prisma } from '../../shared/db/prisma'
import { CreateCtaClickInput } from './cta.types'

export async function registerCtaClick(input: CreateCtaClickInput) {
  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
  })

  if (!business || !business.isActive) {
    const error = new Error('Negocio no encontrado')
    ;(error as any).status = 404
    throw error
  }

  if (input.productId) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    })

    if (!product || !product.isActive) {
      const error = new Error('Producto no encontrado')
      ;(error as any).status = 404
      throw error
    }
  }

  const ctaClick = await prisma.interactionEvent.create({
    data: {
      userId: input.userId ?? null,
      eventType: 'CTA_CLICK',
      metadata: {
        businessId: input.businessId,
        productId: input.productId ?? null,
        sourceScreen: input.sourceScreen,
        entityId: input.productId ?? input.businessId,
      },
    },
  })

  return ctaClick
}