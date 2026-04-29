import { api } from '../../lib/api'

export type BusinessListItem = {
  id: number
  name: string
  category?: string
  description?: string
  city?: string
  address?: string
  phone?: string
  whatsapp?: string
  ratingAverage?: number
  reviewsCount?: number
  activePromotionsCount?: number
  likesCount?: number
  profileImageUrl?: string | null
  isVerified?: boolean
  cover?: {
    url?: string
  } | null
}

export type BusinessLikeState = {
  hasLiked: boolean
  likesCount: number
}

export async function listBusinesses() {
  const response = await api.get('/businesses')
  return (response.data?.data ?? []) as BusinessListItem[]
}

export async function listBusinessesForAdmin() {
  const response = await api.get('/businesses/admin')
  return (response.data?.data ?? []) as BusinessListItem[]
}

export async function getBusinessById<T = any>(id: number | string) {
  const response = await api.get(`/businesses/${id}`)
  return response.data?.data as T
}

export async function toggleBusinessLike(id: number | string) {
  const response = await api.post(`/businesses/${id}/like`)
  return response.data?.data as BusinessLikeState
}

export async function updateBusinessProfileImage<T = any>(
  id: number | string,
  profileImageUrl: string
) {
  const response = await api.patch(`/businesses/${id}/profile-image`, {
    profileImageUrl,
  })
  return response.data?.data as T
}

export async function updateBusinessById<T = any>(
  id: number | string,
  payload: Record<string, unknown>
) {
  const response = await api.patch(`/businesses/${id}`, payload)
  return response.data?.data as T
}

export async function createBusiness<T = any>(payload: Record<string, unknown>) {
  const response = await api.post('/businesses', payload)
  return response.data?.data as T
}

export async function deleteBusinessById(id: number | string) {
  const response = await api.delete(`/businesses/${id}`)
  return response.data?.data as { id: number; name: string; slug: string }
}
