'use client'

import { useEffect } from 'react'
import ReactPlayer from 'react-player'
import { usePlayer } from '@/contexts/player-context'

interface VideoWrapperProps {
  url: string
}

export function VideoWrapper({ url }: VideoWrapperProps) {
  const { playerRef } = usePlayer()

  useEffect(() => {
    const player = playerRef.current
    if (!player) {
      console.log('Player ref not initialized')
      return
    }

    console.log('Player ref initialized')
    const handleTimeUpdate = () => {
      const video = player.getInternalPlayer()
      if (video) {
        const currentTime = player.getCurrentTime()
        console.log('Current time:', currentTime)
        window.dispatchEvent(new CustomEvent('videoTimeUpdate', {
          detail: { currentTime }
        }))
      }
    }

    const interval = setInterval(handleTimeUpdate, 100)

    return () => {
      clearInterval(interval)
    }
  }, [playerRef])

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
      onError={(e) => console.error('Player error:', e)}
      onReady={() => console.log('Player ready')}
    />
  )
} 