export type UserRole = 'USER' | 'ADMIN'

export type SafeUser = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type LoginResponse = {
  user: SafeUser
  accessToken: string
  loginToken: string
}

export type PackageItem = {
  id: string
  name: string
  maxFolders: number
  maxNestingLevel: number
  allowedFileTypes: string[]
  maxFileSizeBytes: number
  totalFileLimit: number
  filesPerFolder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SubscriptionStatus = 'ACTIVE' | 'SWITCHED' | 'EXPIRED'

export type UserSubscription = {
  id: string
  userId: string
  packageId: string
  status: SubscriptionStatus
  isActive: boolean
  startDate: string
  endDate: string | null
  package: PackageItem
}

export type FolderItem = {
  id: string
  userId: string
  name: string
  parentId: string | null
  depth: number
  createdAt: string
  updatedAt: string
}

export type FolderTreeNode = FolderItem & {
  children: FolderTreeNode[]
}

export type FileItem = {
  id: string
  userId: string
  folderId: string
  originalName: string
  storedName: string
  mimeType: string
  extension: string
  sizeBytes: number
  storagePath: string
  createdAt: string
  updatedAt: string
}

export type AdminUserUsage = {
  id: string
  name: string
  email: string
  createdAt: string
  activeSubscription: UserSubscription | null
  usage: {
    folderCount: number
    fileCount: number
  }
}

export type AdminOverview = {
  totalUsers: number
  totalAdmins: number
  totalFolders: number
  totalFiles: number
  totalPackages: number
  activeSubscriptions: number
  packageDistribution: {
    packageId: string
    packageName: string
    activeSubscribers: number
  }[]
}

export type ApiEnvelope<T> = {
  statusCode: number
  success: boolean
  message: string | null
  data: T
  meta?: {
    [key: string]: unknown
  }
}
