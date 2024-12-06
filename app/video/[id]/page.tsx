'use client'

import { VideoPlayer } from '@/components/video-player'
import { CommentsSidebar } from '@/components/comments-sidebar'
import { VideoAuthor } from '@/components/video-author'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayerProvider } from '@/contexts/player-context'
import type { Video } from '@/lib/database.types'
import Lottie from 'lottie-react'
import videoAnimation from '@/public/lottie.json'

export default function VideoPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function loadVideo() {
      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !video) {
        console.error('Error loading video:', error)
        router.push('/dashboard')
        return
      }

      setVideo(video)
    }

    loadVideo()
  }, [params.id, router])

  if (!video) return null

  return (
    <PlayerProvider>
      <div className="flex">
        <div className="flex-1 flex flex-col">
          <div className="container max-w-[1400px] mx-auto px-8 pt-6">
            <div className="w-12 h-12 mb-8">
              <Lottie
                animationData={videoAnimation}
                loop={true}
                className="w-full h-full"
              />
            </div>
            <div className="aspect-video">
              <VideoPlayer videoId={video.id} videoUrl={video.url} />
            </div>
            <div className="py-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">{video.title}</h1>
                <VideoAuthor userId={video.user_id} />
              </div>
              {video.description && (
                <div className="bg-slate-100 p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground">descrição:</p>
                  <p className="mt-1">{video.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-[400px] h-[100vh] border-l">
          <CommentsSidebar videoId={video.id} videoUrl={video.url} />
        </div>
      </div>
    </PlayerProvider>
  )
} 