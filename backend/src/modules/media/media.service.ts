import { cloudinary } from '../../shared/config/cloudinary'
import { prisma } from '../../shared/db/prisma'
import {
  assertCanManageBusiness,
  BusinessActor,
} from '../../shared/authz/businessAccess'

type UploadMediaInput = {
  businessId: number
  productId?: number
  fileBuffer: Buffer
  mimeType: string
  originalName: string
  isPrimary?: boolean
  actor: BusinessActor
}

export async function uploadMedia(input: UploadMediaInput) {
  await assertCanManageBusiness(prisma, input.businessId, input.actor)

  const uploadResult = await new Promise<any>((resolve, reject) => {
    const resourceType = input.mimeType.startsWith('video/') ? 'video' : 'image'

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'proyectoc',
        resource_type: resourceType,
        public_id: `${Date.now()}-${input.originalName.replace(/\s+/g, '-')}`,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    stream.end(input.fileBuffer)
  })

  const media = await prisma.mediaAsset.create({
    data: {
      businessId: input.businessId,
      productId: input.productId ?? null,
      url: uploadResult.secure_url,
      type: uploadResult.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
      isPrimary: input.isPrimary ?? false,
      width: uploadResult.width ?? null,
      height: uploadResult.height ?? null,
      durationSeconds: uploadResult.duration
        ? Math.round(uploadResult.duration)
        : null,
      sortOrder: 1,
    },
  })

  return media
}

export async function setPrimaryMedia(input: {
  businessId: number
  mediaAssetId: number
  isPrimary: boolean
  actor: BusinessActor
}) {
  await assertCanManageBusiness(prisma, input.businessId, input.actor)

  const mediaAsset = await prisma.mediaAsset.findFirst({
    where: {
      id: input.mediaAssetId,
      businessId: input.businessId,
    },
  })

  if (!mediaAsset) {
    const error = new Error('No encontramos el recurso visual solicitado.')
    ;(error as any).status = 404
    throw error
  }

  return prisma.$transaction(async (tx) => {
    const businessMedia = await tx.mediaAsset.findMany({
      where: { businessId: input.businessId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    if (input.isPrimary) {
      await tx.mediaAsset.updateMany({
        where: { businessId: input.businessId },
        data: { isPrimary: false },
      })

      const updated = await tx.mediaAsset.update({
        where: { id: mediaAsset.id },
        data: { isPrimary: true },
      })

      return updated
    }

    await tx.mediaAsset.update({
      where: { id: mediaAsset.id },
      data: { isPrimary: false },
    })

    const nextPrimary = businessMedia.find((item) => item.id !== mediaAsset.id)

    if (nextPrimary) {
      await tx.mediaAsset.updateMany({
        where: { businessId: input.businessId },
        data: { isPrimary: false },
      })

      const updated = await tx.mediaAsset.update({
        where: { id: nextPrimary.id },
        data: { isPrimary: true },
      })

      return updated
    }

    return mediaAsset
  })
}
