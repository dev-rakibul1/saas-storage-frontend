'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/context/auth-context'
import { toErrorMessage } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated, isInitializing } = useAuth()

  const [name, setName] = useState('')
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
      await register({ name, email, password })
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
        <h1>Register</h1>
        <p className="auth-subtitle">Create a user account to start managing files.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>

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
            {busy ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <p className="auth-link-row">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}
