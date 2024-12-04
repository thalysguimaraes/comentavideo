'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'
import ReactPlayer from 'react-player'

interface PlayerContextType {
  seekTo: (time: number) => void
  playerRef: React.RefObject<ReactPlayer>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ReactPlayer>(null)

  const seekTo = (time: number) => {
    console.log('Seeking to:', time)
    if (playerRef.current) {
      console.log('Player ref found, seeking...')
      playerRef.current.seekTo(time, 'seconds')
    } else {
      console.log('Player ref not found')
    }
  }

  return (
    <PlayerContext.Provider value={{ seekTo, playerRef }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
} 