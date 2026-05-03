import { z } from 'zod'

export const createBusinessAdminSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().trim().min(6),
  isActive: z.boolean().optional(),
  businessIds: z.array(z.number().int().positive()).optional(),
  businessId: z.number().int().positive().optional().nullable(),
})

export const updateBusinessAdminSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().optional(),
  isActive: z.boolean().optional(),
  businessIds: z.array(z.number().int().positive()).optional(),
  businessId: z.number().int().positive().optional().nullable(),
})

export const updateBusinessAdminStatusSchema = z.object({
  isActive: z.boolean(),
})

export const updateBusinessAdminPasswordSchema = z.object({
  password: z.string().trim().min(6),
})
