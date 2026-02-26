'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/context/auth-context'
import { apiRequest } from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'
import { FolderTreeNode } from '@/lib/types'
import { flattenFolders, toErrorMessage } from '@/lib/utils'

export default function FoldersPage() {
  const { token, user } = useAuth()

  const [folders, setFolders] = useState<FolderTreeNode[]>([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const folderOptions = useMemo(() => flattenFolders(folders), [folders])

  const loadFolders = useCallback(async () => {
    if (!token) {
      return
    }

    const response = await apiRequest<FolderTreeNode[]>(API_BASE_URL, '/folders/tree', {
      token,
    })

    setFolders(response.data)
  }, [token])

  useEffect(() => {
    if (!token || user?.role !== 'USER') {
      return
    }

    void loadFolders()
  }, [token, user?.role, loadFolders])

  const handleCreateFolder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(API_BASE_URL, '/folders', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name,
          parentId: parentId || undefined,
        },
      })

      setName('')
      setParentId('')
      setShowCreate(false)
      await loadFolders()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const handleRename = async (folderId: string, folderName: string) => {
    const nextName = window.prompt('Enter new folder name', folderName)

    if (!nextName || !nextName.trim()) {
      return
    }

    setBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(API_BASE_URL, `/folders/${folderId}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          name: nextName.trim(),
        },
      })

      await loadFolders()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (folderId: string) => {
    const shouldDelete = window.confirm('Delete this folder and all nested folders/files?')

    if (!shouldDelete) {
      return
    }

    setBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(API_BASE_URL, `/folders/${folderId}`, {
        method: 'DELETE',
        token: token ?? undefined,
      })

      await loadFolders()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  if (user?.role !== 'USER') {
    return (
      <section className="surface-panel">
        <h2>Folders</h2>
        <p className="page-note">Folder operations are available for USER accounts.</p>
      </section>
    )
  }

  return (
    <div className="content-stack">
      <section className="surface-panel">
        <div className="section-header">
          <h2>Folders</h2>
          <button type="button" onClick={() => setShowCreate((prev) => !prev)}>
            {showCreate ? 'Close' : 'Create Folder'}
          </button>
        </div>

        {showCreate ? (
          <form className="inline-form" onSubmit={handleCreateFolder}>
            <label>
              Folder Name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              Parent Folder
              <select
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                <option value="">Root</option>
                {folderOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy}>
              Save
            </button>
          </form>
        ) : null}

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </section>

      <section className="simple-grid folder-grid">
        {folderOptions.map((item) => {
          return (
            <article className="folder-card" key={item.id}>
              <h3>{item.name}</h3>
              <p className="meta-line">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="action-group">
                <button type="button" onClick={() => handleRename(item.id, item.name)}>
                  Rename
                </button>
                <button type="button" className="danger-btn" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </article>
          )
        })}

        {!folderOptions.length ? (
          <article className="folder-card">
            <h3>No folders</h3>
            <p className="meta-line">Create your first folder.</p>
          </article>
        ) : null}
      </section>
    </div>
  )
}
