import { prisma } from '../../shared/db/prisma'
import { hashPassword, comparePassword } from '../../shared/utils/hash'
import { signToken } from '../../shared/utils/jwt'
import { LoginInput, RegisterInput } from './auth.schemas'

type SafeUser = {
  id: number
  name: string
  email: string
  role: string
  businessIds: number[]
  createdAt: Date
  updatedAt: Date
}

function toSafeUser(user: {
  id: number
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
  businessAdmins?: Array<{ businessId: number }>
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessIds: user.businessAdmins?.map((item) => item.businessId) ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existingUser) {
    const error = new Error('El correo ya está registrado')
    ;(error as any).status = 409
    throw error
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  })

  const safeUser = toSafeUser(user)

  const token = signToken({
    sub: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  })

  return {
    user: safeUser,
    token,
  }
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      businessAdmins: {
        select: {
          businessId: true,
        },
      },
    },
  })

  if (!user) {
    const error = new Error('Credenciales inválidas')
    ;(error as any).status = 401
    throw error
  }

  if (!user.isActive || user.deletedAt) {
    const error = new Error('La cuenta está inactiva o no disponible')
    ;(error as any).status = 403
    throw error
  }

  const passwordOk = await comparePassword(input.password, user.passwordHash)

  if (!passwordOk) {
    const error = new Error('Credenciales inválidas')
    ;(error as any).status = 401
    throw error
  }

  const safeUser = toSafeUser(user)

  const token = signToken({
    sub: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  })

  return {
    user: safeUser,
    token,
  }
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      businessAdmins: {
        select: {
          businessId: true,
        },
      },
    },
  })

  if (!user) {
    const error = new Error('Usuario no encontrado')
    ;(error as any).status = 404
    throw error
  }

  if (!user.isActive || user.deletedAt) {
    const error = new Error('La cuenta está inactiva o no disponible')
    ;(error as any).status = 403
    throw error
  }

  return toSafeUser(user)
}
