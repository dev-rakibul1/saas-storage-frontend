'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { apiRequest } from '@/lib/api'
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '@/lib/config'
import { LoginResponse, SafeUser } from '@/lib/types'

type RegisterPayload = {
  name: string
  email: string
  password: string
}

type LoginPayload = {
  email: string
  password: string
}

type AuthContextValue = {
  token: string | null
  user: SafeUser | null
  isInitializing: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

const persistToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    return
  }

  if (!token) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<SafeUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const applySession = (sessionToken: string, sessionUser: SafeUser) => {
    setToken(sessionToken)
    setUser(sessionUser)
    persistToken(sessionToken)
  }

  const clearSession = () => {
    setToken(null)
    setUser(null)
    persistToken(null)
  }

  const refreshProfileWithToken = async (sessionToken: string): Promise<void> => {
    const response = await apiRequest<SafeUser>(API_BASE_URL, '/users/profile', {
      token: sessionToken,
    })

    setUser(response.data)
  }

  const refreshProfile = async (): Promise<void> => {
    if (!token) {
      clearSession()
      return
    }

    await refreshProfileWithToken(token)
  }

  const login = async (payload: LoginPayload): Promise<void> => {
    const response = await apiRequest<LoginResponse>(API_BASE_URL, '/users/login', {
      method: 'POST',
      body: payload,
    })

    applySession(response.data.accessToken, response.data.user)
  }

  const register = async (payload: RegisterPayload): Promise<void> => {
    await apiRequest<SafeUser>(API_BASE_URL, '/users/register', {
      method: 'POST',
      body: payload,
    })

    await login({
      email: payload.email,
      password: payload.password,
    })
  }

  const logout = (): void => {
    clearSession()
  }

  useEffect(() => {
    let isMounted = true

    const bootstrapSession = async () => {
      const savedToken = getStoredToken()

      if (!savedToken) {
        if (isMounted) {
          setIsInitializing(false)
        }
        return
      }

      if (isMounted) {
        setToken(savedToken)
      }

      try {
        await refreshProfileWithToken(savedToken)
      } catch {
        clearSession()
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    void bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [])

  const value: AuthContextValue = {
    token,
    user,
    isInitializing,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}
