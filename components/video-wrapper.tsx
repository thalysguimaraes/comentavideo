'use client'

import { useEffect } from 'react'
import ReactPlayer from 'react-player'
import { usePlayer } from '@/contexts/player-context'

interface VideoWrapperProps {
  url: string
}

export function VideoWrapper({ url }: VideoWrapperProps) {
  const { playerRef } = usePlayer()

  return (
    <ReactPlayer
      ref={playerRef}
      url={url}
      width="100%"
      height="100%"
      controls
      config={{
        file: {
          attributes: {
            controlsList: 'nodownload',
            disablePictureInPicture: true
          }
        }
      }}
      progressInterval={100}
      onProgress={({ playedSeconds }) => {
        window.dispatchEvent(
          new CustomEvent('videoTimeUpdate', {
            detail: { currentTime: playedSeconds }
          })
        )
      }}
      onError={(e) => console.error('Player error:', e)}
    />
  )
} 