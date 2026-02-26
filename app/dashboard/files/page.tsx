'use client'

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from '@/components/context/auth-context'
import { apiDownload, apiRequest } from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'
import { FileItem, FolderTreeNode } from '@/lib/types'
import { flattenFolders, formatBytes, readFileAsDataUrl, toErrorMessage } from '@/lib/utils'

export default function FilesPage() {
  const { token, user } = useAuth()

  const [folders, setFolders] = useState<FolderTreeNode[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [targetFolderId, setTargetFolderId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const folderOptions = useMemo(() => flattenFolders(folders), [folders])

  const loadFilesPageData = useCallback(async () => {
    if (!token) {
      return
    }

    const [foldersRes, filesRes] = await Promise.all([
      apiRequest<FolderTreeNode[]>(API_BASE_URL, '/folders/tree', { token }),
      apiRequest<FileItem[]>(API_BASE_URL, '/files', { token }),
    ])

    setFolders(foldersRes.data)
    setFiles(filesRes.data)
  }, [token])

  useEffect(() => {
    if (!token || user?.role !== 'USER') {
      return
    }

    void loadFilesPageData()
  }, [token, user?.role, loadFilesPageData])

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null)
  }

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage('Please select a file.')
      return
    }

    if (!targetFolderId) {
      setErrorMessage('Please select a target folder.')
      return
    }

    setBusy(true)
    setErrorMessage('')

    try {
      const contentBase64 = await readFileAsDataUrl(selectedFile)

      await apiRequest(API_BASE_URL, '/files/upload', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          folderId: targetFolderId,
          originalName: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          contentBase64,
        },
      })

      setSelectedFile(null)
      setTargetFolderId('')
      setShowUpload(false)
      await loadFilesPageData()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const handleRename = async (fileId: string, currentName: string) => {
    const nextName = window.prompt('Enter new file name', currentName)

    if (!nextName || !nextName.trim()) {
      return
    }

    setBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(API_BASE_URL, `/files/${fileId}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          originalName: nextName,
        },
      })

      await loadFilesPageData()
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async (file: FileItem) => {
    setBusy(true)
    setErrorMessage('')

    try {
      await apiDownload(API_BASE_URL, `/files/${file.id}/download`, token ?? '', file.originalName)
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  if (user?.role !== 'USER') {
    return (
      <section className="surface-panel">
        <h2>Files</h2>
        <p className="page-note">File operations are available for USER accounts.</p>
      </section>
    )
  }

  return (
    <div className="content-stack">
      <section className="surface-panel">
        <div className="section-header">
          <h2>Files</h2>
          <button type="button" onClick={() => setShowUpload((prev) => !prev)}>
            {showUpload ? 'Close' : 'Upload File'}
          </button>
        </div>

        {showUpload ? (
          <form className="inline-form" onSubmit={handleUpload}>
            <label>
              Folder
              <select
                value={targetFolderId}
                onChange={(event) => setTargetFolderId(event.target.value)}
                required
              >
                <option value="">Select folder</option>
                {folderOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              File
              <input type="file" onChange={handleFileInput} required />
            </label>

            <button type="submit" disabled={busy}>
              Upload
            </button>
          </form>
        ) : null}

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </section>

      <section className="surface-panel">
        <div className="table-wrap clean-table">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.originalName}</td>
                  <td>{file.mimeType}</td>
                  <td>{formatBytes(file.sizeBytes)}</td>
                  <td>
                    <div className="action-group">
                      <button type="button" onClick={() => handleDownload(file)}>
                        Download
                      </button>
                      <button type="button" onClick={() => handleRename(file.id, file.originalName)}>
                        Rename
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!files.length ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    No files found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
