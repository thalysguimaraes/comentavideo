'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VideoUploadForm } from '@/components/video-upload-form'
import { useRouter } from 'next/navigation'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const router = useRouter()

  const handleSuccess = () => {
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar vídeo</DialogTitle>
        </DialogHeader>
        <VideoUploadForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
} 