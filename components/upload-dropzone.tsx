'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'

export function UploadDropzone() {
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)
    }
    getUser()
  }, [supabase])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''),
          url: publicUrl,
          user_id: user.id
        })

      if (dbError) throw dbError

      toast({
        title: 'Vídeo enviado!',
        description: 'Seu vídeo foi enviado com sucesso.'
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: error.message
      })
    } finally {
      setUploading(false)
    }
  }, [user, supabase, toast, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Upload className="h-12 w-12" />
        {uploading ? (
          <span>Enviando...</span>
        ) : isDragActive ? (
          <span>Solte o arquivo aqui</span>
        ) : (
          <>
            <span>Arraste um vídeo ou clique para selecionar</span>
            <span className="text-xs">MP4, WebM ou Ogg (max 100MB)</span>
          </>
        )}
      </div>
    </div>
  )
} 