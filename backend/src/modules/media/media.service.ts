import { cloudinary } from '../../shared/config/cloudinary'
import { prisma } from '../../shared/db/prisma'

type UploadMediaInput = {
  businessId: number
  productId?: number
  fileBuffer: Buffer
  mimeType: string
  originalName: string
  isPrimary?: boolean
}

export async function uploadMedia(input: UploadMediaInput) {
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