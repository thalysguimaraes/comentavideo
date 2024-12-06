'use client'

import { VideoGrid } from '@/components/dashboard/video-grid'
import { Database } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { VideoUploadForm } from '@/components/video-upload-form'
import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'

type Video = Database['public']['Tables']['videos']['Row'] & {
  views_count: number
  comments_count: number
}

interface DashboardClientProps {
  initialVideos: Video[]
}

export function DashboardClient({ initialVideos }: DashboardClientProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [videos, setVideos] = useState(initialVideos)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUploadSuccess = () => {
    setShowUploadDialog(false)
    startTransition(() => {
      router.refresh()
    })
  }

  const handleDeleteSuccess = (videoId: string) => {
    // Optimistically update UI
    setVideos(currentVideos => currentVideos.filter(v => v.id !== videoId))
    // Force router refresh to ensure server state is synced
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="container max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl font-semibold">seus vídeos</h1>
          <p className="text-sm text-muted-foreground">
            {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
          </p>
        </div>
        <Button 
          id="new-video-button"
          onClick={() => setShowUploadDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          novo vídeo
        </Button>
      </div>

      <VideoGrid videos={videos} onDeleteSuccess={handleDeleteSuccess} />

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>novo vídeo</DialogTitle>
          </DialogHeader>
          <VideoUploadForm onSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
} 