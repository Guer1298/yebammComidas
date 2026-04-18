import { api } from '../../lib/api'

export async function getProductById<T = any>(id: number | string) {
  const response = await api.get(`/products/${id}`)
  return response.data?.data as T
}

export async function createProduct<T = any>(payload: Record<string, unknown>) {
  const response = await api.post('/products', payload)
  return response.data?.data as T
}

export async function updateProductById<T = any>(
  id: number | string,
  payload: Record<string, unknown>
) {
  const response = await api.patch(`/products/${id}`, payload)
  return response.data?.data as T
}

export async function deactivateProductById<T = any>(id: number | string) {
  const response = await api.patch(`/products/${id}/deactivate`)
  return response.data?.data as T
}
