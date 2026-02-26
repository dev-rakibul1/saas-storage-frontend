'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/context/auth-context'
import { apiRequest } from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'
import { FileItem, FolderTreeNode, UserSubscription, AdminOverview } from '@/lib/types'
import { formatBytes, toErrorMessage } from '@/lib/utils'

export default function DashboardHomePage() {
  const { token, user } = useAuth()

  const [folderCount, setFolderCount] = useState(0)
  const [fileCount, setFileCount] = useState(0)
  const [storageBytes, setStorageBytes] = useState(0)
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token || !user) {
      return
    }

    const loadDashboard = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        if (user.role === 'ADMIN') {
          const adminRes = await apiRequest<AdminOverview>(API_BASE_URL, '/admin/overview', {
            token,
          })

          setAdminOverview(adminRes.data)
          setLoading(false)
          return
        }

        const [foldersRes, filesRes] = await Promise.all([
          apiRequest<FolderTreeNode[]>(API_BASE_URL, '/folders/tree', { token }),
          apiRequest<FileItem[]>(API_BASE_URL, '/files', { token }),
        ])

        const subscriptionRes = await apiRequest<UserSubscription>(
          API_BASE_URL,
          '/subscriptions/current',
          {
            token,
          }
        )

        const folders = foldersRes.data
        const files = filesRes.data

        const countFolders = (nodes: FolderTreeNode[]): number => {
          return nodes.reduce((count, node) => count + 1 + countFolders(node.children), 0)
        }

        setFolderCount(countFolders(folders))
        setFileCount(files.length)
        setStorageBytes(files.reduce((sum, item) => sum + item.sizeBytes, 0))
        setCurrentSubscription(subscriptionRes.data)
      } catch (error) {
        setErrorMessage(toErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [token, user])

  if (loading) {
    return <div className="page-note">Loading dashboard...</div>
  }

  if (errorMessage) {
    return <div className="page-error">{errorMessage}</div>
  }

  if (!user) {
    return null
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="content-stack">
        <section className="stat-grid four-col">
          <article className="stat-box">
            <p>Total Users</p>
            <strong>{adminOverview?.totalUsers ?? 0}</strong>
          </article>
          <article className="stat-box">
            <p>Total Files</p>
            <strong>{adminOverview?.totalFiles ?? 0}</strong>
          </article>
          <article className="stat-box">
            <p>Total Folders</p>
            <strong>{adminOverview?.totalFolders ?? 0}</strong>
          </article>
          <article className="stat-box">
            <p>Active Subscriptions</p>
            <strong>{adminOverview?.activeSubscriptions ?? 0}</strong>
          </article>
        </section>

        <section className="surface-panel">
          <h2>Package Distribution</h2>
          <div className="simple-grid">
            {adminOverview?.packageDistribution.map((item) => (
              <article key={item.packageId} className="simple-card">
                <h3>{item.packageName}</h3>
                <p>Subscribers: {item.activeSubscribers}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="content-stack">
      <section className="stat-grid four-col">
        <article className="stat-box">
          <p>Total Folders</p>
          <strong>{folderCount}</strong>
        </article>
        <article className="stat-box">
          <p>Total Files</p>
          <strong>{fileCount}</strong>
        </article>
        <article className="stat-box">
          <p>Current Package</p>
          <strong>{currentSubscription?.package.name ?? 'No package'}</strong>
        </article>
        <article className="stat-box">
          <p>Storage Status</p>
          <strong>{formatBytes(storageBytes)}</strong>
        </article>
      </section>

      <section className="surface-panel">
        <h2>Quick Status</h2>
        <p className="page-note">
          Your dashboard is protected by auth guard. If session/token is removed, this page
          redirects to login.
        </p>
      </section>
    </div>
  )
}
