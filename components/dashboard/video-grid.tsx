'use client'

import { VideoCard } from './video-card'
import { useToast } from '@/hooks/use-toast'
import { deleteVideo } from '@/app/actions'
import { useState, useEffect } from 'react'
import type { Database } from '@/lib/database.types'
import { cn } from '@/lib/utils'
import { Video as VideoIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Video = Database['public']['Tables']['videos']['Row'] & {
  views_count: number
  comments_count: number
}

interface VideoGridProps {
  videos: Video[]
  onDeleteSuccess?: (videoId: string) => void
}

export function VideoGrid({ videos: initialVideos, onDeleteSuccess }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const { toast } = useToast()

  // Update local state when props change
  useEffect(() => {
    setVideos(initialVideos)
  }, [initialVideos])

  const handleDelete = async (videoId: string) => {
    try {
      await deleteVideo(videoId)
      
      // Update local state immediately
      setVideos(currentVideos => currentVideos.filter(v => v.id !== videoId))

      // Notify parent component
      onDeleteSuccess?.(videoId)

      toast({
        title: 'Vídeo excluído',
        description: 'O vídeo foi excluído com sucesso.'
      })
    } catch (error) {
      console.error('Delete operation failed:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error instanceof Error 
          ? error.message 
          : 'Não foi possível excluir o vídeo.'
      })
    }
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <VideoIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">nenhum vídeo encontrado</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-[360px]">
          você ainda não tem nenhum vídeo. clique no botão acima para fazer seu primeiro upload.
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4"
    )}>
      {videos.map((video: Video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          url={video.url}
          thumbnailUrl={video.thumbnail_url}
          viewCount={video.views_count}
          commentCount={video.comments_count}
          onDelete={() => handleDelete(video.id)}
        />
      ))}
    </div>
  )
} 