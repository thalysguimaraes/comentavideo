import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const VideoWrapper = dynamic(
  () => import('./video-wrapper').then(mod => mod.VideoWrapper),
  { ssr: false }
)

interface VideoPlayerProps {
  url: string
  title: string
  description: string
}

export function VideoPlayer({ url, title, description }: VideoPlayerProps) {
  console.log('VideoPlayer props:', { url, title, description })
  
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
          <VideoWrapper url={url} />
        </Suspense>
      </div>
      
      {/* Description section */}
      <div className="p-6 bg-card">
        <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  )
}