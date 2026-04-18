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
  cover?: {
    url?: string
  } | null
}

export async function listBusinesses() {
  const response = await api.get('/businesses')
  return (response.data?.data ?? []) as BusinessListItem[]
}

export async function getBusinessById<T = any>(id: number | string) {
  const response = await api.get(`/businesses/${id}`)
  return response.data?.data as T
}

export async function updateBusinessById<T = any>(
  id: number | string,
  payload: Record<string, unknown>
) {
  const response = await api.patch(`/businesses/${id}`, payload)
  return response.data?.data as T
}
