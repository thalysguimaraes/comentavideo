'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { Progress } from '@/components/ui/progress'
import { VideoFormDialog } from '@/components/video-form-dialog'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'

export function UploadDropzone() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedVideo, setUploadedVideo] = useState<{ id: string, url: string } | null>(null)
  const { user } = useUser()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: "Você precisa estar logado para fazer upload de vídeos."
      })
      return
    }

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

      // Obter URL pública do vídeo
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      // Salvar registro no banco
      const { error: insertError, data: insertData } = await supabase
        .from('videos')
        .insert({
          url: publicUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          status: 'draft',
          user_id: user.id
        })
        .select()
        .single()

      if (insertError) throw insertError

      setUploadedVideo({
        id: insertData.id,
        url: publicUrl
      })

      toast({
        title: "Upload concluído",
        description: "Seu vídeo foi enviado com sucesso."
      })

    } catch (error) {
      console.error('Erro detalhado:', error)
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload do vídeo."
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [user, toast, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1
  })

  return (
    <>
      <div 
        {...getRootProps()} 
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p>Solte o arquivo aqui...</p>
        ) : (
          <p>Arraste um vídeo ou clique para selecionar</p>
        )}
        {uploading && (
          <Progress value={progress} className="mt-4" />
        )}
      </div>

      {uploadedVideo && (
        <VideoFormDialog
          videoId={uploadedVideo.id}
          videoUrl={uploadedVideo.url}
          onClose={() => setUploadedVideo(null)}
        />
      )}
    </>
  )
} 