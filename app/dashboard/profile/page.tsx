'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/components/context/auth-context'
import { apiRequest } from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'
import { SafeUser, UserRole, UserSubscription } from '@/lib/types'
import { toErrorMessage } from '@/lib/utils'

export default function ProfilePage() {
  const { token, user, refreshProfile } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [busy, setBusy] = useState(false)
  const [roleSwitchBusy, setRoleSwitchBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [roleSwitchMessage, setRoleSwitchMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [roleSwitchErrorMessage, setRoleSwitchErrorMessage] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    setName(user.name)
    setEmail(user.email)
  }, [user])

  useEffect(() => {
    if (!token || user?.role !== 'USER') {
      setCurrentSubscription(null)
      return
    }

    const loadSubscription = async () => {
      try {
        const response = await apiRequest<UserSubscription>(
          API_BASE_URL,
          '/subscriptions/current',
          {
            token,
          }
        )

        setCurrentSubscription(response.data)
      } catch {
        setCurrentSubscription(null)
      }
    }

    void loadSubscription()
  }, [token, user?.role])

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setBusy(true)
    setMessage('')
    setErrorMessage('')

    try {
      const payload: { name?: string; email?: string; password?: string } = {}

      if (name.trim() && name.trim() !== user?.name) {
        payload.name = name.trim()
      }

      if (email.trim() && email.trim() !== user?.email) {
        payload.email = email.trim()
      }

      if (password.trim()) {
        payload.password = password.trim()
      }

      if (!Object.keys(payload).length) {
        setMessage('No changes detected.')
        return
      }

      await apiRequest(API_BASE_URL, '/users/profile', {
        method: 'PATCH',
        token: token ?? undefined,
        body: payload,
      })

      setPassword('')
      await refreshProfile()
      setMessage('Profile updated successfully.')
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const handleRoleSwitch = async (role: UserRole) => {
    if (!token) {
      return
    }

    setRoleSwitchBusy(true)
    setRoleSwitchMessage('')
    setRoleSwitchErrorMessage('')

    try {
      await apiRequest<SafeUser>(API_BASE_URL, '/users/test-role', {
        method: 'PATCH',
        token,
        body: { role },
      })

      await refreshProfile()
      setRoleSwitchMessage(
        `Switched to ${role}. Test purpose only, not a production requirement.`
      )
    } catch (error) {
      setRoleSwitchErrorMessage(toErrorMessage(error))
    } finally {
      setRoleSwitchBusy(false)
    }
  }

  return (
    <div className="content-stack">
      <section className="surface-panel">
        <h2>Profile</h2>

        <div className="profile-info">
          <p>
            <span>Name:</span> {user?.name}
          </p>
          <p>
            <span>Email:</span> {user?.email}
          </p>
          <p>
            <span>Role:</span> {user?.role}
          </p>
          <p>
            <span>Package:</span>{' '}
            {user?.role === 'USER'
              ? currentSubscription?.package.name ?? 'No active package'
              : 'Not applicable'}
          </p>
        </div>
      </section>

      <section className="surface-panel">
        <h2>Update Profile</h2>
        <form className="clean-form" onSubmit={handleUpdate}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password (optional)
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit" disabled={busy}>
            Save Changes
          </button>
        </form>

        {message ? <p className="page-note success">{message}</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </section>

      <section className="surface-panel">
        <h2>Role Switch (Test Only)</h2>
        <p className="page-note warning">
          Warning: This route is for testing only and not a production requirement.
        </p>

        <div className="action-group">
          <button
            type="button"
            disabled={roleSwitchBusy || user?.role === 'USER'}
            onClick={() => handleRoleSwitch('USER')}
          >
            Switch to USER
          </button>
          <button
            type="button"
            disabled={roleSwitchBusy || user?.role === 'ADMIN'}
            onClick={() => handleRoleSwitch('ADMIN')}
          >
            Switch to ADMIN
          </button>
        </div>

        {roleSwitchMessage ? <p className="page-note success">{roleSwitchMessage}</p> : null}
        {roleSwitchErrorMessage ? (
          <p className="form-error">{roleSwitchErrorMessage}</p>
        ) : null}
      </section>
    </div>
  )
}
