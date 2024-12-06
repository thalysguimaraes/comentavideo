'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { UploadDialog } from '@/components/dashboard/upload-dialog'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  userId: string
  videoCount: number
}

export function DashboardLayoutClient({ children, userId, videoCount }: LayoutProps) {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className="flex h-screen">
      <Sidebar userId={userId} />
      <div className="flex-1 flex flex-col">
        <header className="mt-2">
          <div className="container flex items-center justify-between h-16 py-10">
            <div>
              <h1 className="text-xl font-semibold">meus vídeos</h1>
              <p className="text-sm text-muted-foreground">
                {videoCount} vídeos
              </p>
            </div>
            <Button className='rounded-xl' onClick={() => setUploadOpen(true)}>
              novo vídeo
            </Button>
          </div>
        </header>
        {children}
        <UploadDialog 
          open={uploadOpen} 
          onOpenChange={setUploadOpen} 
        />
      </div>
    </div>
  )
} 