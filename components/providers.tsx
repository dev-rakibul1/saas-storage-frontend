'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './context/auth-context'

const Providers = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>
}

export default Providers
