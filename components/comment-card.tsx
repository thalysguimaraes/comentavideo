'use client'

import { formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play, Trash2 } from 'lucide-react'
import { usePlayer } from '@/contexts/player-context'
import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

// Function to generate a consistent color based on a string
function stringToColor(str: string) {
  let hash = 0;
  const string = str.toLowerCase(); // normalize the string
  
  // Use a better hash function for more distinct values
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use prime numbers to get better distribution
  const h = Math.abs(hash % 271) / 271; // Use prime number for better distribution
  
  // Generate HSL with golden ratio for better color distribution
  const hue = Math.floor(h * 360);
  const saturation = 75; // Fixed saturation
  const lightness = 60; // Fixed lightness for readability
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

interface UserInitialAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

function UserInitialAvatar({ name, size = 'sm' }: UserInitialAvatarProps) {
  const initial = name.charAt(0).toUpperCase()
  const color = stringToColor(name)
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  )
}

interface CommentCardProps {
  comment: {
    id: string
    content: string
    timestamp: number
    created_at: string
    author_name: string
    video_id: string
  }
  videoUrl: string
  onDelete: (commentId: string) => Promise<void>
}

export function CommentCard({ comment, videoUrl, onDelete }: CommentCardProps) {
  const { seekTo } = usePlayer()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState(false)
  const currentUser = localStorage.getItem('author_name')
  const isOwnComment = currentUser === comment.author_name
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadThumbnail() {
      try {
        const { data: video } = await supabase
          .from('videos')
          .select('thumbnail_url')
          .eq('id', comment.video_id)
          .single()

        if (video?.thumbnail_url) {
          setThumbnailUrl(video.thumbnail_url)
          setThumbnailError(false)
        }
      } catch (error) {
        console.error('Error loading thumbnail:', error)
        setThumbnailError(true)
      }
    }

    loadThumbnail()
  }, [comment.video_id, supabase])

  const handleTimeClick = () => {
    seekTo(comment.timestamp)
  }

  const handleDelete = async () => {
    await onDelete(comment.id)
    setShowDeleteAlert(false)
  }

  return (
    <>
      <div className="p-3 bg-card rounded-lg border">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <UserInitialAvatar name={comment.author_name} />
            <span className="font-medium text-sm">{comment.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleTimeClick}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {formatTime(comment.timestamp)}
            </Button>
            {isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                className="text-xs text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center group"
            onClick={handleTimeClick}
          >
            <div className="absolute inset-0">
              {thumbnailUrl && !thumbnailError ? (
                <Image
                  src={thumbnailUrl}
                  alt={`Momento ${formatTime(comment.timestamp)}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                  crossOrigin="anonymous"
                  onError={() => {
                    console.error('Error loading thumbnail:', thumbnailUrl)
                    setThumbnailError(true)
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <Play className="absolute w-6 h-6 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-1 right-1 text-[10px] text-white font-medium shadow">
              {formatTime(comment.timestamp)}
            </span>
          </button>
          <p className="text-sm flex-1">{comment.content}</p>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 