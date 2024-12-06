'use client'

import { VideoCard } from './video-card'
import { useToast } from '@/hooks/use-toast'
import { deleteVideo } from '@/app/actions'
import { useState, useEffect } from 'react'
import type { Database } from '@/lib/database.types'

type Video = Database['public']['Tables']['videos']['Row'] & {
  views_count: number
  comments_count: number
}

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos: initialVideos }: VideoGridProps) {
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
      setVideos((currentVideos: Video[]) => currentVideos.filter((v: Video) => v.id !== videoId))

      toast({
        title: 'Vídeo excluído',
        description: 'O vídeo foi excluído com sucesso.'
      })
    } catch (error) {
      console.error('Delete operation failed:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o vídeo.'
      })
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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