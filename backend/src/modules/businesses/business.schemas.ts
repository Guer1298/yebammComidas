import { z } from 'zod'

export const updateBusinessProfileImageSchema = z.object({
  profileImageUrl: z.string().trim().url(),
})

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).optional().nullable(),
  category: z.string().trim().min(2).max(120),
  businessType: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  aboutArticle: z.string().trim().max(5000).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  website: z.string().trim().url().optional().nullable(),
  instagram: z.string().trim().max(120).optional().nullable(),
  facebook: z.string().trim().max(120).optional().nullable(),
  tiktok: z.string().trim().max(120).optional().nullable(),
  coverImageUrl: z.string().trim().url(),
  profileImageUrl: z.string().trim().url().optional().nullable(),
  isActive: z.boolean().optional(),
  adminName: z.string().trim().min(2).max(120).optional().nullable(),
  adminEmail: z.string().trim().email(),
  adminPassword: z.string().trim().min(6),
  creatorDisplayName: z.string().trim().max(120).optional().nullable(),
})

export const updateBusinessSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(2).max(140).optional(),
  category: z.string().trim().min(2).max(120).optional(),
  businessType: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  aboutArticle: z.string().trim().max(5000).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  website: z.string().trim().url().optional().nullable(),
  instagram: z.string().trim().max(120).optional().nullable(),
  facebook: z.string().trim().max(120).optional().nullable(),
  tiktok: z.string().trim().max(120).optional().nullable(),
  foundedAt: z.union([z.string(), z.date()]).optional().nullable(),
  capacity: z.number().int().nonnegative().optional().nullable(),
  isActive: z.boolean().optional(),
  coverImageUrl: z.string().trim().url().optional().nullable(),
  profileImageUrl: z.string().trim().url().optional().nullable(),
  isVerified: z.boolean().optional(),
  primaryAdminUserId: z.number().int().positive().optional().nullable(),
  confirmSlugChange: z.boolean().optional(),
})

export const updateBusinessStatusSchema = z.object({
  isActive: z.boolean(),
})
