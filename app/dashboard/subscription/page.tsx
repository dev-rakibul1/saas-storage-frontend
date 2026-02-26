'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/context/auth-context'
import { apiRequest } from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'
import { PackageItem, UserSubscription } from '@/lib/types'
import { formatBytes, toErrorMessage } from '@/lib/utils'

const INITIAL_PACKAGE_FORM = {
  name: '',
  maxFolders: 5,
  maxNestingLevel: 3,
  allowedFileTypesText: 'IMAGE,PDF',
  maxFileSizeBytes: 5 * 1024 * 1024,
  totalFileLimit: 20,
  filesPerFolder: 10,
}

export default function SubscriptionPage() {
  const { token, user } = useAuth()

  const [packages, setPackages] = useState<PackageItem[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [editingPackageId, setEditingPackageId] = useState('')
  const [packageForm, setPackageForm] = useState(INITIAL_PACKAGE_FORM)

  const loadData = useCallback(async () => {
    if (!token || !user) {
      return
    }

    if (user.role === 'ADMIN') {
      const packagesRes = await apiRequest<PackageItem[]>(
        API_BASE_URL,
        '/packages?includeInactive=true',
        { token }
      )

      setPackages(packagesRes.data)
      return
    }

    const [packagesRes, currentRes] = await Promise.all([
      apiRequest<PackageItem[]>(API_BASE_URL, '/subscriptions/packages', { token }),
      apiRequest<UserSubscription>(API_BASE_URL, '/subscriptions/current', { token }),
    ])

    setPackages(packagesRes.data)
    setCurrentSubscription(currentRes.data)
  }, [token, user])

  useEffect(() => {
    if (!token || !user) {
      return
    }

    void loadData()
  }, [token, user, loadData])

  const handleSelectPackage = async (packageId: string) => {
    setBusy(true)
    setErrorMessage('')

    try {
      await apiRequest<UserSubscription>(API_BASE_URL, '/subscriptions/select', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          packageId,
        },
      })

      await loadData()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const resetForm = () => {
    setEditingPackageId('')
    setPackageForm(INITIAL_PACKAGE_FORM)
  }

  const parseAllowedTypes = (value: string): string[] => {
    return [...new Set(value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean))]
  }

  const handleSavePackage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setErrorMessage('')

    try {
      const payload = {
        name: packageForm.name,
        maxFolders: Number(packageForm.maxFolders),
        maxNestingLevel: Number(packageForm.maxNestingLevel),
        allowedFileTypes: parseAllowedTypes(packageForm.allowedFileTypesText),
        maxFileSizeBytes: Number(packageForm.maxFileSizeBytes),
        totalFileLimit: Number(packageForm.totalFileLimit),
        filesPerFolder: Number(packageForm.filesPerFolder),
      }

      if (editingPackageId) {
        await apiRequest(API_BASE_URL, `/packages/${editingPackageId}`, {
          method: 'PATCH',
          token: token ?? undefined,
          body: payload,
        })
      } else {
        await apiRequest(API_BASE_URL, '/packages', {
          method: 'POST',
          token: token ?? undefined,
          body: payload,
        })
      }

      resetForm()
      await loadData()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const handleDeletePackage = async (packageId: string) => {
    const shouldDelete = window.confirm('Deactivate this package?')

    if (!shouldDelete) {
      return
    }

    setBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(API_BASE_URL, `/packages/${packageId}`, {
        method: 'DELETE',
        token: token ?? undefined,
      })

      await loadData()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="content-stack">
      {user.role === 'USER' ? (
        <section className="surface-panel">
          <h2>Current Plan</h2>
          <p className="page-note">{currentSubscription?.package.name ?? 'No active plan'}</p>
        </section>
      ) : (
        <section className="surface-panel">
          <h2>Package Management</h2>
          <form className="clean-form" onSubmit={handleSavePackage}>
            <label>
              Name
              <input
                value={packageForm.name}
                onChange={(event) =>
                  setPackageForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Max Folders
              <input
                type="number"
                min={1}
                value={packageForm.maxFolders}
                onChange={(event) =>
                  setPackageForm((prev) => ({
                    ...prev,
                    maxFolders: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label>
              Max Nesting Level
              <input
                type="number"
                min={1}
                value={packageForm.maxNestingLevel}
                onChange={(event) =>
                  setPackageForm((prev) => ({
                    ...prev,
                    maxNestingLevel: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label>
              Allowed File Types
              <input
                value={packageForm.allowedFileTypesText}
                onChange={(event) =>
                  setPackageForm((prev) => ({
                    ...prev,
                    allowedFileTypesText: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Max File Size (bytes)
              <input
                type="number"
                min={1}
                value={packageForm.maxFileSizeBytes}
                onChange={(event) =>
                  setPackageForm((prev) => ({
                    ...prev,
                    maxFileSizeBytes: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label>
              Total File Limit
              <input
                type="number"
                min={1}
                value={packageForm.totalFileLimit}
                onChange={(event) =>
                  setPackageForm((prev) => ({
                    ...prev,
                    totalFileLimit: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
            <label>
              Files Per Folder
              <input
                type="number"
                min={1}
                value={packageForm.filesPerFolder}
                onChange={(event) =>
                  setPackageForm((prev) => ({
                    ...prev,
                    filesPerFolder: Number(event.target.value),
                  }))
                }
                required
              />
            </label>

            <div className="action-group">
              <button type="submit" disabled={busy}>
                {editingPackageId ? 'Update Package' : 'Create Package'}
              </button>
              {editingPackageId ? (
                <button type="button" className="ghost-action" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      )}

      <section className="simple-grid plan-grid">
        {packages.map((item) => {
          const isCurrent = currentSubscription?.packageId === item.id

          return (
            <article className="plan-card" key={item.id}>
              <h3>
                {item.name}{' '}
                {!item.isActive ? <span className="status-pill">Inactive</span> : null}
              </h3>
              <p>Folders: {item.maxFolders}</p>
              <p>Nesting: {item.maxNestingLevel}</p>
              <p>Max file size: {formatBytes(item.maxFileSizeBytes)}</p>
              <p>Total files: {item.totalFileLimit}</p>
              <p>Files/folder: {item.filesPerFolder}</p>
              <p>Types: {item.allowedFileTypes.join(', ')}</p>

              {user.role === 'USER' ? (
                <button
                  type="button"
                  disabled={busy || isCurrent}
                  onClick={() => handleSelectPackage(item.id)}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              ) : (
                <div className="action-group">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackageId(item.id)
                      setPackageForm({
                        name: item.name,
                        maxFolders: item.maxFolders,
                        maxNestingLevel: item.maxNestingLevel,
                        allowedFileTypesText: item.allowedFileTypes.join(','),
                        maxFileSizeBytes: item.maxFileSizeBytes,
                        totalFileLimit: item.totalFileLimit,
                        filesPerFolder: item.filesPerFolder,
                      })
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDeletePackage(item.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </section>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
    </div>
  )
}
