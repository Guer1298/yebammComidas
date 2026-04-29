import { z } from 'zod'

export const updateBusinessProfileImageSchema = z.object({
  profileImageUrl: z.string().trim().url(),
})
