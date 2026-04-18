import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),

  email: z
    .string()
    .email('Correo inválido')
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres'),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email('Correo inválido')
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>