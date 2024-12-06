'use client'

import { VideoPlayer } from '@/components/video-player'
import { CommentsSidebar } from '@/components/comments-sidebar'
import { VideoAuthor } from '@/components/video-author'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayerProvider } from '@/contexts/player-context'
import type { Database } from '@/lib/database.types'
import Lottie from 'lottie-react'
import videoAnimation from '@/public/lottie.json'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, MessageSquare, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Video = Database['public']['Tables']['videos']['Row']

export default function VideoPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [isCommentsClosing, setIsCommentsClosing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { user } = useUser()

  useEffect(() => {
    async function loadVideo() {
      setIsLoading(true)
      setError(null)
      
      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !video) {
        console.error('Error loading video:', error)
        setError('Vídeo não encontrado')
        router.push('/dashboard')
        return
      }

      setVideo(video as Video)
      setIsLoading(false)
    }

    loadVideo()
  }, [params.id, router, supabase])

  // Prevent body scroll when comments are open on mobile
  useEffect(() => {
    if (showComments) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showComments])

  const handleCloseComments = () => {
    setIsCommentsClosing(true)
    setTimeout(() => {
      setShowComments(false)
      setIsCommentsClosing(false)
    }, 200)
  }

  if (!video) return null

  const showBackButton = user && video.user_id === user.id

  return (
    <PlayerProvider>
      <div className="flex">
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="container max-w-[1400px] mx-auto px-4 sm:px-8 pt-6">
            <div className="flex items-center gap-4 mb-8">
              {showBackButton && (
                <Button variant="secondary" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <div className="w-12 h-12">
                <Lottie
                  animationData={videoAnimation}
                  loop={true}
                  className="w-full h-full"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className="ml-auto lg:hidden relative"
                onClick={() => setShowComments(true)}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <VideoPlayer videoId={video.id} videoUrl={video.url} />
            </div>
            <div className="py-8">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">{video.title}</h1>
                <VideoAuthor userId={video.user_id} />
              </div>
              {video.description && (
                <div className="bg-slate-100 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground">descrição:</p>
                  <p className="mt-1 text-sm sm:text-base">{video.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments sidebar - desktop */}
        <div className="hidden lg:block w-[400px] h-[100vh] border-l">
          <CommentsSidebar videoId={video.id} videoUrl={video.url} />
        </div>

        {/* Comments sidebar - mobile overlay */}
        <div 
          className={cn(
            "fixed inset-0 bg-background z-50 lg:hidden transition-transform duration-200 ease-in-out",
            showComments ? "translate-y-0" : "translate-y-full",
            isCommentsClosing && "translate-y-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="font-semibold">Comentários</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCloseComments}
              className="hover:bg-background/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-[calc(100vh-64px)]">
            <CommentsSidebar videoId={video.id} videoUrl={video.url} />
          </div>
        </div>
      </div>
    </PlayerProvider>
  )
} 