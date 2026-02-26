import { ApiEnvelope } from './types'

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  token?: string
  body?: unknown
}

const normalizeBaseUrl = (baseUrl: string): string => {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export const apiRequest = async <T>(
  baseUrl: string,
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiEnvelope<T>> => {
  const url = `${normalizeBaseUrl(baseUrl)}${endpoint}`

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  let requestBody: BodyInit | undefined

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(options.body)
  }

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(url, {
    method: options?.method ?? 'GET',
    headers,
    body: requestBody,
    cache: 'no-store',
  })

  const responseData = (await response.json()) as ApiEnvelope<T> & {
    errorMessages?: Array<{ message: string }>
  }

  if (!response.ok) {
    const serverMessage = responseData.message || responseData.errorMessages?.[0]?.message
    throw new Error(serverMessage ?? 'Request failed.')
  }

  return responseData
}

export const apiDownload = async (
  baseUrl: string,
  endpoint: string,
  token: string,
  fallbackFileName: string
): Promise<void> => {
  const url = `${normalizeBaseUrl(baseUrl)}${endpoint}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to download file.')
  }

  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = fallbackFileName
  anchor.click()
  window.URL.revokeObjectURL(downloadUrl)
}
