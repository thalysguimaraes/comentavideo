'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { VideoUploadForm } from '@/components/video-upload-form'
import { X } from 'lucide-react'

interface UploadDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UploadDrawer({ open, onOpenChange, onSuccess }: UploadDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Enviar vídeo</h1>
            <p className="text-muted-foreground mt-2">
              Faça upload de um vídeo para compartilhar com outras pessoas
            </p>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <VideoUploadForm 
          onSuccess={() => {
            onSuccess?.()
            onOpenChange(false)
          }} 
        />
      </SheetContent>
    </Sheet>
  )
} 