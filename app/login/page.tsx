'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/context/auth-context'
import { toErrorMessage } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isInitializing } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isInitializing, isAuthenticated, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setErrorMessage('')

    try {
      await login({ email, password })
      router.replace('/dashboard')
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  if (isInitializing) {
    return <div className="screen-center">Checking session...</div>
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Access your SaaS file management dashboard.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={busy}>
            {busy ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <p className="auth-link-row">
          New here? <Link href="/register">Create account</Link>
        </p>

        <p className="auth-note">
          Admin demo: <code>admin@saas-storage.local</code> / <code>Admin@12345</code>
        </p>
      </section>
    </main>
  )
}
