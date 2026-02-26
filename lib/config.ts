const API_PREFIX = '/api/v1'

const getApiOrigin = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://saas-file-management-api.vercel.app'
  }

  return 'http://localhost:5000'
}

const normalizeApiBaseUrl = (value?: string): string => {
  const origin = (value ?? getApiOrigin()).trim().replace(/\/+$/, '')

  if (origin.endsWith(API_PREFIX)) {
    return origin
  }

  return `${origin}${API_PREFIX}`
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
)

export const TOKEN_STORAGE_KEY = 'saas_access_token'
