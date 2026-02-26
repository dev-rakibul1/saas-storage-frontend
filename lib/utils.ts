import { FolderTreeNode } from './types'

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error occurred.'
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export const flattenFolders = (
  nodes: FolderTreeNode[],
  depth = 0,
  output: Array<{ id: string; name: string; label: string; createdAt: string }> = []
): Array<{ id: string; name: string; label: string; createdAt: string }> => {
  nodes.forEach((node) => {
    const prefix = depth > 0 ? `${'  '.repeat(depth)}↳ ` : ''

    output.push({
      id: node.id,
      name: node.name,
      label: `${prefix}${node.name}`,
      createdAt: node.createdAt,
    })

    flattenFolders(node.children, depth + 1, output)
  })

  return output
}

export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result

      if (typeof result !== 'string') {
        reject(new Error('Failed to read selected file.'))
        return
      }

      resolve(result)
    }

    reader.onerror = () => reject(new Error('Failed to read selected file.'))
    reader.readAsDataURL(file)
  })
}
