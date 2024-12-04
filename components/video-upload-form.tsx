'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createSupabaseClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileWithPreview extends File {
  preview?: string
}

interface VideoUploadFormProps {
  onSuccess?: () => void
}

export function VideoUploadForm({ onSuccess }: VideoUploadFormProps) {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 100 // 100MB
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return

    setUploading(true)
    setProgress(0)

    try {
      // Upload do vídeo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      // Salvar no banco
      const { error: insertError, data: video } = await supabase
        .from('videos')
        .insert({
          url: publicUrl,
          title: title.trim() || file.name,
          description: description.trim() || null,
          status: 'published',
          user_id: user.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast({
        title: 'Vídeo enviado com sucesso!',
        description: 'O vídeo foi publicado.'
      })

      // Chamar callback de sucesso ao invés de redirecionar
      onSuccess?.()
      
      // Atualizar a lista de vídeos
      router.refresh()
    } catch (error) {
      console.error('Erro ao enviar:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar vídeo',
        description: 'Não foi possível fazer o upload do vídeo.'
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const removeFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFile(null)
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary" : "border-border hover:border-primary/50",
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? (
              "Solte o arquivo aqui..."
            ) : (
              "Arraste um vídeo ou clique para selecionar"
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            MP4, MOV ou AVI até 100MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              src={file.preview}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite um título para o vídeo"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite uma descrição para o vídeo"
              />
            </div>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Enviando vídeo...
              </p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            disabled={uploading}
          >
            {uploading ? "Enviando..." : "Publicar vídeo"}
          </Button>
        </div>
      )}
    </form>
  )
} 