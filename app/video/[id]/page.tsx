import { createSupabaseServer } from '@/lib/supabase'
import { VideoPlayer } from '@/components/video-player'
import { CommentsSidebar } from '@/components/comments-sidebar'
import { AuthorDialog } from '@/components/author-dialog'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PlayerProvider } from '@/contexts/player-context'
import { auth } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VideoAuthor } from '@/components/video-author'

export default async function VideoPage({ params }: { params: { id: string } }) {
  const { userId } = auth()
  const supabase = await createSupabaseServer()
  
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!video) {
    notFound()
  }

  const timeAgo = formatDistanceToNow(new Date(video.created_at), {
    addSuffix: true,
    locale: ptBR
  })

  const isOwner = userId === video.user_id

  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen">
        {/* Topbar */}
        <div className="h-14 border-b flex items-center px-8 py-8 bg-background">
          <div className="flex-1 flex items-center gap-4">
            {isOwner && (
              <Link 
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}
            <div>
              <h1 className="font-medium truncate">{video.title || 'Sem título'}</h1>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          {/* Autor do vídeo */}
          <VideoAuthor userId={video.user_id} />
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video section */}
          <div className="flex-1 bg-muted overflow-y-auto">
            <div className="max-w-[1200px] mx-auto px-8 py-8">
              <VideoPlayer 
                url={video.url} 
                title={video.title || 'Sem título'} 
                description={video.description || 'Sem descrição'}
              />
            </div>
          </div>

          {/* Comments sidebar */}
          <div className="w-[400px] border-l">
            <CommentsSidebar 
              videoId={video.id} 
              videoUrl={video.url}
            />
          </div>
        </div>

        <AuthorDialog />
      </div>
    </PlayerProvider>
  )
} 