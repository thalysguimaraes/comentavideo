'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const VideoWrapper = dynamic(
  () => import('./video-wrapper').then(mod => mod.VideoWrapper),
  { ssr: false }
)

interface VideoPlayerProps {
  videoId: string
  videoUrl: string
}

export function VideoPlayer({ videoId, videoUrl }: VideoPlayerProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-black shadow-lg">
      <div className="aspect-video relative">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="animate-pulse text-muted-foreground">
              Carregando player...
            </div>
          </div>
        }>
          <VideoWrapper url={videoUrl} />
        </Suspense>
      </div>
    </div>
  )
}