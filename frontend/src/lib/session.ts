export type StoredUser = {
  id: number
  name: string
  email: string
  role: string
  businessIds?: number[]
}

export function getStoredUser() {
  const raw = localStorage.getItem('auth_user')

  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function getPrimaryBusinessId() {
  const user = getStoredUser()
  const businessId = user?.businessIds?.[0]

  return typeof businessId === 'number' ? businessId : null
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('auth_token') && getStoredUser())
}
