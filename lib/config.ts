const DEFAULT_API_ORIGIN = 'http://localhost:5000'
const API_PREFIX = '/api/v1'

const normalizeApiBaseUrl = (value?: string): string => {
  const normalizedOrigin = (value ?? DEFAULT_API_ORIGIN).trim().replace(/\/+$/, '')

  if (normalizedOrigin.endsWith(API_PREFIX)) {
    return normalizedOrigin
  }

  return `${normalizedOrigin}${API_PREFIX}`
}

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)

export const TOKEN_STORAGE_KEY = 'saas_access_token'
