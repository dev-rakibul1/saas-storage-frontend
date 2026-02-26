'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/context/auth-context'

type DashboardLayoutProps = {
  children: ReactNode
}

type MenuItem = {
  href: string
  label: string
}

const USER_MENU: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/folders', label: 'Folders' },
  { href: '/dashboard/files', label: 'Files' },
  { href: '/dashboard/subscription', label: 'Subscription' },
  { href: '/dashboard/profile', label: 'Profile' },
]

const ADMIN_MENU: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/subscription', label: 'Subscription' },
  { href: '/dashboard/profile', label: 'Profile' },
]

const PAGE_TITLE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/folders': 'Folders',
  '/dashboard/files': 'Files',
  '/dashboard/subscription': 'Subscription',
  '/dashboard/profile': 'Profile',
}

const isActivePath = (pathname: string, href: string): boolean => {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname.startsWith(href)
}

const getInitials = (name: string): string => {
  const segments = name
    .trim()
    .split(' ')
    .filter(Boolean)

  if (!segments.length) {
    return 'U'
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 1).toUpperCase()
  }

  return `${segments[0][0]}${segments[1][0]}`.toUpperCase()
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated, isInitializing } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isInitializing, isAuthenticated, router])

  const pageTitle = PAGE_TITLE_MAP[pathname] ?? 'Dashboard'
  const menuItems = useMemo(
    () => (user?.role === 'ADMIN' ? ADMIN_MENU : USER_MENU),
    [user?.role]
  )

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  if (isInitializing || !isAuthenticated || !user) {
    return <div className="screen-center">Checking access...</div>
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <strong>Storage SaaS</strong>
          <span>{user.role === 'ADMIN' ? 'Admin Workspace' : 'User Workspace'}</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`sidebar-link ${isActivePath(pathname, item.href) ? 'active' : ''}`}
              onClick={() => setMobileSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
            >
              Menu
            </button>
            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-right">
            <div className="avatar-pill">
              <span>{getInitials(user.name)}</span>
              <p>{user.name}</p>
            </div>
            <button type="button" className="ghost-action" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-content">{children}</section>
      </div>

      {mobileSidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}
    </div>
  )
}
