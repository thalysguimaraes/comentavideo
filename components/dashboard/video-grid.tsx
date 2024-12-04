'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createSupabaseClient } from "@/lib/supabase"
import { MoreVertical, Upload, Film } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { VideoFormDialog } from "../video-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { UploadDrawer } from "../upload-drawer"

interface Video {
  id: string
  title: string | null
  description: string | null
  url: string
  views_count: number
  comments_count: number
}

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos: initialVideos }: VideoGridProps) {
  const [videos, setVideos] = useState(initialVideos)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [showUploadDrawer, setShowUploadDrawer] = useState(false)
  const supabase = createSupabaseClient()
  const { toast } = useToast()

  const handleDelete = async (videoId: string, videoUrl: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) throw error

      // Deletar o arquivo do storage
      const fileName = videoUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('videos')
          .remove([fileName])
      }

      setVideos(videos => videos.filter(v => v.id !== videoId))
      
      toast({
        title: 'Vídeo excluído',
        description: 'O vídeo foi removido com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o vídeo.'
      })
    }
  }

  const copyToClipboard = (videoId: string) => {
    const shareUrl = `${window.location.origin}/video/${videoId}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: 'Link copiado!',
      description: 'O link do vídeo foi copiado para sua área de transferência.'
    })
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8">
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Ícone estilizado */}
          <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
            <Film className="w-12 h-12 text-slate-300" />
          </div>
          
          {/* Texto */}
          <h2 className="text-lg font-bold mb-2">
            Nenhum vídeo encontrado
          </h2>
          <p className="text-muted-foreground text-sm max-w-[300px] mb-8">
            Comece fazendo upload do seu primeiro vídeo para receber feedback e comentários.
          </p>
          
          {/* Botão de ação */}
          <Button 
            size="lg" 
            onClick={() => setShowUploadDrawer(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Fazer upload
          </Button>
        </div>

        <UploadDrawer 
          open={showUploadDrawer} 
          onOpenChange={setShowUploadDrawer}
        />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="group relative bg-card rounded-lg overflow-hidden border"
          >
            {/* Thumbnail */}
            <Link href={`/video/${video.id}`}>
              <div className="aspect-video bg-muted relative">
                <video
                  src={video.url}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              </div>
            </Link>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/video/${video.id}`} className="flex-1">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title || 'Sem título'}
                  </h3>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="relative z-10 h-8 w-8 shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDelete(video.id, video.url)}>
                      Excluir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingVideo(video)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(video.id)}>
                      Compartilhar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span>{video.views_count} visualizações</span>
                <span>{video.comments_count} comentários</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingVideo && (
        <VideoFormDialog
          videoId={editingVideo.id}
          videoUrl={editingVideo.url}
          onClose={() => setEditingVideo(null)}
        />
      )}
    </>
  )
} 