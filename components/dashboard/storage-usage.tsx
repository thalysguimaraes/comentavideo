'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const STORAGE_LIMIT_MB = 1024 // 1GB em MB

interface StorageUsageProps {
  userId: string
}

interface Video {
  url: string
}

export function StorageUsage({ userId }: StorageUsageProps) {
  const [storageUsed, setStorageUsed] = useState(0)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function calculateStorageUsage() {
      try {
        // Get list of files from storage directly
        const { data: files, error } = await supabase
          .storage
          .from('videos')
          .list(`${userId}/videos`)

        if (error) {
          console.error('Error listing files:', error)
          return
        }

        // Calculate total size in MB
        const totalSize = files.reduce((acc, file) => {
          return acc + (file.metadata?.size || 0) / (1024 * 1024)
        }, 0)

        setStorageUsed(totalSize)
      } catch (error) {
        console.error('Error calculating storage usage:', error)
      }
    }

    calculateStorageUsage()
  }, [userId, supabase])

  return (
    <div className="py-8 border-b">
      <p className="text-sm font-medium">uso de armazenamento</p>
      <p className="text-xs text-muted-foreground">
        {storageUsed.toFixed(2)}MB de 1GB
      </p>
      <div className="h-1 bg-secondary mt-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${(storageUsed / STORAGE_LIMIT_MB) * 100}%` }}
        />
      </div>
    </div>
  )
} 