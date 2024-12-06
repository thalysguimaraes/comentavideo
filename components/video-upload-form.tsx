'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X } from 'lucide-react'
import { uploadVideo } from '@/app/actions'
import { generateQuickThumbnail } from '@/lib/client-utils'
import { Label } from '@/components/ui/label'

interface VideoUploadFormProps {
  onSuccess?: () => void
}

export function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setSelectedFile(file)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    try {
      setUploading(true)

      // Generate thumbnail client-side
      const thumbnailBlob = await generateQuickThumbnail(selectedFile)
      const thumbnail = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('thumbnail', thumbnail)
      formData.append('title', title)
      if (description) formData.append('description', description)

      await uploadVideo(formData)

      toast({
        title: 'sucesso!',
        description: 'vídeo enviado com sucesso.'
      })

      // Reset form
      setSelectedFile(null)
      setTitle('')
      setDescription('')
      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'erro ao enviar',
        description: error.message
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            arraste um vídeo ou clique para selecionar
          </p>
        </div>
      ) : (
        <div className="relative border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {Math.round(selectedFile.size / 1024 / 1024)}MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">título do vídeo</Label>
          <Input
            id="title"
            placeholder="preencha o título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">descrição</Label>
          <Textarea
            id="description"
            placeholder="é opcional, mas ajuda"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!selectedFile || !title || uploading}
        className="w-full"
      >
        {uploading ? 'enviando...' : 'enviar vídeo'}
      </Button>
    </form>
  )
} 